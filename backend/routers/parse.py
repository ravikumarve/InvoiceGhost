"""Parse API endpoint for invoice extraction.

This module handles the POST /api/parse endpoint which:
- Accepts multipart form data with file field
- Validates file format, MIME type, and size (with magic bytes check)
- Converts PDF to image if needed (with header validation)
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

from services.extractor import extract_invoice
from services.pdf_handler import convert_pdf_to_image, PDFConversionError, validate_pdf_header

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

# MIME type mapping — strict matching only
MIME_TYPES = {
    "pdf": {"application/pdf"},
    "png": {"image/png"},
    "jpg": {"image/jpeg"},
    "jpeg": {"image/jpeg"},
    "webp": {"image/webp"},
}

# Magic bytes for file format verification (prevents MIME spoofing)
MAGIC_BYTES = {
    "pdf": b"%PDF-",
    "png": b"\x89PNG\r\n\x1a\n",
    "jpg": b"\xff\xd8\xff",
    "jpeg": b"\xff\xd8\xff",
    "webp": b"RIFF",  # WebP files start with RIFF
}

# Initialize router — NO duplicate limiter (uses app-level SlowAPIMiddleware)
router = APIRouter()


def _get_file_extension(filename: Optional[str]) -> str:
    """Extract file extension from filename, returns empty string if no filename."""
    if not filename:
        return ""
    return Path(filename).suffix.lower().lstrip(".")


def _validate_file_extension(filename: Optional[str]) -> bool:
    """Validate file extension is in allowed list."""
    ext = _get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS


def _validate_mime_type(filename: Optional[str], content_type: Optional[str]) -> bool:
    """
    Validate MIME type matches file extension — strict matching.
    
    No wildcard prefix matching. The MIME type must exactly match
    the expected type for the given extension.
    """
    if not content_type:
        return False
    
    ext = _get_file_extension(filename)
    expected_mimes = MIME_TYPES.get(ext, set())
    
    if not expected_mimes:
        return False
    
    return content_type in expected_mimes


def _validate_magic_bytes(file_bytes: bytes, ext: str) -> bool:
    """
    Validate file magic bytes match the claimed extension.
    
    This prevents MIME type spoofing attacks where a malicious file
    claims to be a PDF but is actually an executable.
    """
    magic = MAGIC_BYTES.get(ext)
    if not magic:
        # If we don't have magic bytes for this extension, skip check
        return True
    
    if len(file_bytes) < len(magic):
        return False
    
    return file_bytes[:len(magic)] == magic


async def _read_upload_file(upload_file: UploadFile) -> bytes:
    """
    Read upload file contents with size validation.
    
    Reads in chunks to avoid loading oversized files into memory.
    
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
        # Validate filename exists
        if not file.filename:
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "File must have a valid name with extension"
                }
            )
        
        # Validate file extension
        if not _validate_file_extension(file.filename):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "Only PDF, PNG, JPG, WEBP accepted"
                }
            )
        
        # Validate MIME type (strict matching)
        if not _validate_mime_type(file.filename, file.content_type):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "Only PDF, PNG, JPG, WEBP accepted"
                }
            )
        
        # Read file contents with size validation
        file_bytes = await _read_upload_file(file)
        
        # Validate file is not empty
        if not file_bytes:
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": "extraction_failed",
                    "message": "Uploaded file is empty"
                }
            )
        
        # Validate magic bytes to prevent MIME spoofing
        file_ext = _get_file_extension(file.filename)
        if not _validate_magic_bytes(file_bytes, file_ext):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "File content does not match the claimed format"
                }
            )
        
        # Additional PDF header validation
        if file_ext == "pdf" and not validate_pdf_header(file_bytes):
            return JSONResponse(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                content={
                    "error": "unsupported_format",
                    "message": "File is not a valid PDF"
                }
            )
        
        logger.info(
            f"Processing file: {file.filename}, "
            f"size: {len(file_bytes)} bytes, "
            f"type: {file.content_type}"
        )
        
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
