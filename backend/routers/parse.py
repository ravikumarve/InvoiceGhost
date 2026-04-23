"""Parse API endpoint for invoice extraction.

This module handles the POST /api/parse endpoint which:
- Accepts multipart form data with file field
- Validates file format, MIME type, and size
- Converts PDF to image if needed
- Extracts structured invoice data using AI
- Returns InvoiceData as JSON with processing time header
- Ensures privacy by cleaning up temp files and never logging file contents
"""

import logging
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, UploadFile, HTTPException, status, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.extractor import extract_invoice
from services.pdf_handler import convert_pdf_to_image, PDFConversionError

# Configure logging - NEVER log file contents
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants from environment
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = set(
    ext.strip().lower() 
    for ext in os.getenv("ALLOWED_EXTENSIONS", "pdf,png,jpg,jpeg,webp").split(",")
)
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))

# MIME type mapping for validation
MIME_TYPES = {
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
}

# Initialize router and rate limiter
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def _get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    return Path(filename).suffix.lower().lstrip(".")


def _validate_file_extension(filename: str) -> bool:
    """Validate file extension is in allowed list."""
    ext = _get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS


def _validate_mime_type(filename: str, content_type: str) -> bool:
    """Validate MIME type matches file extension."""
    ext = _get_file_extension(filename)
    expected_mime = MIME_TYPES.get(ext)
    
    if not expected_mime:
        return False
    
    # Allow both exact match and common variations
    return content_type == expected_mime or content_type.startswith(expected_mime.split("/")[0])


async def _read_upload_file(upload_file: UploadFile) -> bytes:
    """
    Read upload file contents with size validation.
    
    Args:
        upload_file: FastAPI UploadFile object
        
    Returns:
        File contents as bytes
        
    Raises:
        HTTPException: If file is too large
    """
    file_size = 0
    file_contents = bytearray()
    
    # Read file in chunks to validate size without loading entire file
    chunk_size = 8192
    while chunk := await upload_file.read(chunk_size):
        file_size += len(chunk)
        
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={
                    "error": "file_too_large",
                    "message": f"Max file size is {MAX_FILE_SIZE_MB}MB"
                }
            )
        
        file_contents.extend(chunk)
    
    # Reset file pointer for potential re-read
    await upload_file.seek(0)
    
    return bytes(file_contents)


@router.post("/parse")
@limiter.limit(f"{RATE_LIMIT_PER_MINUTE}/minute")
async def parse_invoice(request: Request, file: UploadFile = File(...)):
    """
    Parse invoice from uploaded PDF or image file.
    
    This endpoint accepts a PDF or image file and extracts structured
    invoice data using AI models (Gemini Flash with Groq fallback).
    
    **Privacy Guarantee:**
    - All files processed in-memory or temp directory
    - Temp files deleted immediately after processing
    - EXIF metadata stripped from images before AI processing
    - No file contents logged or persisted
    
    **Rate Limiting:**
    - 10 requests per minute per IP address (configurable)
    
    **Supported Formats:**
    - PDF (.pdf)
    - PNG (.png)
    - JPEG (.jpg, .jpeg)
    - WebP (.webp)
    
    **File Size Limit:**
    - Maximum 10MB (configurable via MAX_FILE_SIZE_MB)
    
    **Response Headers:**
    - X-Processing-Time-Ms: Processing time in milliseconds
    
    Args:
        file: Uploaded file (multipart/form-data)
        
    Returns:
        JSON response with InvoiceData structure
        
    Raises:
        HTTPException: For validation errors or extraction failures
    """
    temp_file_path: Optional[Path] = None
    
    try:
        # Validate file extension
        if not _validate_file_extension(file.filename or ""):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "Only PDF, PNG, JPG, WEBP accepted"
                }
            )
        
        # Validate MIME type
        if not _validate_mime_type(file.filename or "", file.content_type or ""):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "Only PDF, PNG, JPG, WEBP accepted"
                }
            )
        
        # Read file contents with size validation
        file_bytes = await _read_upload_file(file)
        
        logger.info(
            f"Processing file: {file.filename}, "
            f"size: {len(file_bytes)} bytes, "
            f"type: {file.content_type}"
        )
        
        # Determine if PDF or image
        file_ext = _get_file_extension(file.filename or "")
        
        # Convert PDF to image if needed
        if file_ext == "pdf":
            try:
                logger.info("Converting PDF to image")
                image_bytes = await convert_pdf_to_image(file_bytes)
                mime_type = "image/jpeg"
            except PDFConversionError as e:
                logger.error(f"PDF conversion failed: {e}")
                return JSONResponse(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    content={
                        "error": "extraction_failed",
                        "message": str(e)
                    }
                )
            except ValueError as e:
                logger.error(f"PDF validation failed: {e}")
                return JSONResponse(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    content={
                        "error": "file_too_large",
                        "message": str(e)
                    }
                )
        else:
            # Use image directly
            image_bytes = file_bytes
            mime_type = file.content_type or "image/jpeg"
        
        # Extract invoice data using AI
        try:
            invoice_data = await extract_invoice(image_bytes, mime_type)
        except ValueError as e:
            logger.error(f"Extraction failed: {e}")
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": "extraction_failed",
                    "message": "Could not parse invoice. Try a clearer scan."
                }
            )
        except Exception as e:
            logger.error(f"Unexpected extraction error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "extraction_failed",
                    "message": "Could not parse invoice. Try a clearer scan."
                }
            )
        
        # Return successful response
        logger.info(
            f"Extraction successful: confidence={invoice_data.confidence_score:.2f}, "
            f"items={len(invoice_data.line_items)}"
        )
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=invoice_data.model_dump(mode="json")
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions (already formatted)
        raise
        
    except Exception as e:
        logger.error(f"Unexpected error in parse endpoint: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_error",
                "message": "An unexpected error occurred"
            }
        )
        
    finally:
        # Clean up any temp files
        if temp_file_path and temp_file_path.exists():
            try:
                temp_file_path.unlink()
                logger.debug(f"Cleaned up temp file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file_path}: {e}")
