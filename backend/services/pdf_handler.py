"""PDF to image conversion service with privacy-first temp file handling.

This module:
- Converts PDF first page to JPEG at 300 DPI
- Validates PDF header before processing (early rejection of non-PDFs)
- Handles password-protected, corrupted, and oversized PDFs
- Guarantees temp file cleanup in finally blocks
- Uses timeout protection for all conversion operations
"""

import asyncio
import io
import logging
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from pdf2image import convert_from_bytes
from PIL import Image

# Configure logging without exposing file contents
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
PDF_DPI = 300
PDF_TIMEOUT = 30.0
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


class PDFConversionError(Exception):
    """Custom exception for PDF conversion errors."""
    pass


async def convert_pdf_to_image(pdf_bytes: bytes) -> bytes:
    """
    Convert first page of PDF to image bytes at 300 DPI.
    
    This function handles PDF to image conversion with proper:
    - Privacy: All temp files cleaned up immediately
    - Error handling: Corrupted, password-protected, invalid PDFs
    - Performance: Optimized for speed with timeout protection
    - Memory: Efficient handling of large PDFs
    
    Args:
        pdf_bytes: Raw PDF file bytes
        
    Returns:
        Image bytes (JPEG format, first page only)
        
    Raises:
        PDFConversionError: If PDF conversion fails with user-friendly message
        ValueError: If input is invalid or file too large
    """
    # Validate input
    if not pdf_bytes:
        raise ValueError("PDF data is empty")
    
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(
            f"PDF file too large ({len(pdf_bytes) / 1024 / 1024:.1f}MB). "
            f"Maximum size is {MAX_FILE_SIZE_MB}MB."
        )
    
    # Validate PDF header before attempting conversion
    if not validate_pdf_header(pdf_bytes):
        raise PDFConversionError(
            "The file is not a valid PDF. "
            "Please upload a PDF file."
        )
    
    # Create temp directory for PDF processing
    temp_dir = tempfile.mkdtemp(prefix="invoiceghost_pdf_")
    temp_path = Path(temp_dir)
    
    try:
        # Write PDF bytes to temp file (required by pdf2image)
        pdf_path = temp_path / "input.pdf"
        pdf_path.write_bytes(pdf_bytes)
        
        logger.info(f"Converting PDF to image (size: {len(pdf_bytes)} bytes)")
        
        # Convert PDF to image with timeout
        images = await asyncio.wait_for(
            asyncio.to_thread(
                convert_from_bytes,
                pdf_bytes,
                dpi=PDF_DPI,
                first_page=1,
                last_page=1,  # Only first page
                fmt="jpeg",
                thread_count=1,  # Single thread for better stability
            ),
            timeout=PDF_TIMEOUT
        )
        
        if not images:
            raise PDFConversionError(
                "Could not extract any pages from PDF. "
                "The file may be corrupted or empty."
            )
        
        # Get first page image
        first_page = images[0]
        
        # Convert PIL image to bytes
        output = io.BytesIO()
        first_page.save(output, format="JPEG", quality=95)
        output.seek(0)
        
        image_bytes = output.getvalue()
        
        logger.info(
            f"PDF conversion successful: {len(image_bytes)} bytes, "
            f"size: {first_page.size[0]}x{first_page.size[1]}"
        )
        
        return image_bytes
        
    except asyncio.TimeoutError:
        logger.error("PDF conversion timeout")
        raise PDFConversionError(
            "PDF processing took too long. "
            "Try a smaller file or simpler PDF."
        )
        
    except PDFConversionError:
        # Re-raise our own errors
        raise
        
    except ValueError:
        # Re-raise validation errors
        raise
        
    except Exception as e:
        error_msg = str(e).lower()
        
        # Handle specific PDF errors with user-friendly messages
        if "password" in error_msg or "encrypted" in error_msg:
            logger.error("Password-protected PDF detected")
            raise PDFConversionError(
                "Password-protected PDFs are not supported. "
                "Please remove password protection and try again."
            )
            
        elif "corrupt" in error_msg or "invalid" in error_msg or "not a pdf" in error_msg:
            logger.error(f"Corrupted/invalid PDF: {e}")
            raise PDFConversionError(
                "The PDF file appears to be corrupted or invalid. "
                "Please try a different file."
            )
            
        else:
            logger.error(f"PDF conversion failed: {e}")
            raise PDFConversionError(
                "Failed to process PDF. "
                "Please try a different file or a clearer scan."
            )
            
    finally:
        # Clean up temp directory and ALL files — guaranteed
        _cleanup_temp_dir(temp_path)


def _cleanup_temp_dir(temp_path: Path) -> None:
    """
    Clean up temporary directory and all files.
    
    Uses shutil.rmtree for robust recursive deletion.
    This ensures no PDF data persists after processing,
    maintaining privacy-first principles.
    
    Args:
        temp_path: Path to temporary directory
    """
    try:
        if temp_path.exists():
            shutil.rmtree(temp_path, ignore_errors=True)
            logger.debug(f"Cleaned up temp directory: {temp_path}")
    except Exception as e:
        logger.error(f"Failed to clean up temp directory {temp_path}: {e}")


def validate_pdf_header(pdf_bytes: bytes) -> bool:
    """
    Validate PDF file header to detect invalid files early.
    
    Checks for PDF magic number (%PDF-) at the start of file.
    This catches files that claim to be PDFs but aren't.
    
    Args:
        pdf_bytes: Raw PDF file bytes
        
    Returns:
        True if valid PDF header, False otherwise
    """
    if not pdf_bytes or len(pdf_bytes) < 5:
        return False
    
    # Check for PDF magic number
    header = pdf_bytes[:5]
    return header == b"%PDF-"


async def get_pdf_page_count(pdf_bytes: bytes) -> Optional[int]:
    """
    Get the number of pages in a PDF file.
    
    Uses low DPI for fast page count detection.
    
    Args:
        pdf_bytes: Raw PDF file bytes
        
    Returns:
        Number of pages, or None if detection fails
    """
    if not validate_pdf_header(pdf_bytes):
        return None
    
    temp_dir = tempfile.mkdtemp(prefix="invoiceghost_pdf_count_")
    temp_path = Path(temp_dir)
    
    try:
        # Get page count with timeout and low DPI for speed
        page_count = await asyncio.wait_for(
            asyncio.to_thread(
                convert_from_bytes,
                pdf_bytes,
                dpi=72,  # Low DPI for faster page count
                fmt="jpeg",
                thread_count=1,
            ),
            timeout=10.0
        )
        
        count = len(page_count)
        logger.info(f"PDF page count: {count}")
        return count
        
    except asyncio.TimeoutError:
        logger.warning("Page count detection timeout")
        return None
    except Exception as e:
        logger.warning(f"Failed to get page count: {e}")
        return None
    finally:
        _cleanup_temp_dir(temp_path)
