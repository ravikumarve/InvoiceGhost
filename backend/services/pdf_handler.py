"""PDF to image conversion service with privacy-first temp file handling."""

import asyncio
import io
import logging
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
    
    # Create temp directory for PDF processing
    temp_dir = tempfile.mkdtemp(prefix="invoiceghost_pdf_")
    temp_path = Path(temp_dir)
    
    try:
        # Write PDF bytes to temp file
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
        
    except Exception as e:
        error_msg = str(e)
        
        # Handle specific PDF errors with user-friendly messages
        if "password" in error_msg.lower() or "encrypted" in error_msg.lower():
            logger.error("Password-protected PDF detected")
            raise PDFConversionError(
                "Password-protected PDFs are not supported. "
                "Please remove password protection and try again."
            )
            
        elif "corrupt" in error_msg.lower() or "invalid" in error_msg.lower():
            logger.error(f"Corrupted PDF detected: {e}")
            raise PDFConversionError(
                "The PDF file appears to be corrupted or invalid. "
                "Please try a different file."
            )
            
        elif "not a pdf" in error_msg.lower() or "unrecognized" in error_msg.lower():
            logger.error(f"Invalid PDF format: {e}")
            raise PDFConversionError(
                "The file is not a valid PDF. "
                "Please upload a PDF file."
            )
            
        else:
            logger.error(f"PDF conversion failed: {e}")
            raise PDFConversionError(
                f"Failed to process PDF: {error_msg}. "
                "Please try a different file or contact support."
            )
            
    finally:
        # Clean up temp directory and all files
        _cleanup_temp_dir(temp_path)


def _cleanup_temp_dir(temp_path: Path) -> None:
    """
    Clean up temporary directory and all files.
    
    This ensures no PDF data persists after processing,
    maintaining privacy-first principles.
    
    Args:
        temp_path: Path to temporary directory
    """
    try:
        if temp_path.exists():
            # Remove all files in directory
            for file_path in temp_path.iterdir():
                try:
                    if file_path.is_file():
                        file_path.unlink()
                    elif file_path.is_dir():
                        # Recursively remove subdirectories
                        _cleanup_temp_dir(file_path)
                except Exception as e:
                    logger.warning(f"Failed to delete temp file {file_path}: {e}")
            
            # Remove directory itself
            temp_path.rmdir()
            logger.debug(f"Cleaned up temp directory: {temp_path}")
            
    except Exception as e:
        logger.error(f"Failed to clean up temp directory {temp_path}: {e}")


def validate_pdf_header(pdf_bytes: bytes) -> bool:
    """
    Validate PDF file header to detect invalid files early.
    
    Checks for PDF magic number (%PDF-) at the start of file.
    
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
    
    This is useful for validation and logging purposes.
    
    Args:
        pdf_bytes: Raw PDF file bytes
        
    Returns:
        Number of pages, or None if detection fails
    """
    try:
        temp_dir = tempfile.mkdtemp(prefix="invoiceghost_pdf_count_")
        temp_path = Path(temp_dir)
        
        try:
            # Write PDF bytes to temp file
            pdf_path = temp_path / "input.pdf"
            pdf_path.write_bytes(pdf_bytes)
            
            # Get page count with timeout
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
            
    except Exception as e:
        logger.error(f"Page count detection error: {e}")
        return None