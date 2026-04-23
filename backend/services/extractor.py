"""AI-powered invoice extraction service with Gemini Flash and Groq fallback."""

import asyncio
import base64
import io
import json
import logging
from pathlib import Path
from typing import Optional

import google.generativeai as genai
from groq import Groq
from PIL import Image

from models.invoice import InvoiceData

# Configure logging without exposing file contents
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
GEMINI_MODEL = "gemini-1.5-flash"
GEMINI_TIMEOUT = 30.0
GROQ_TIMEOUT = 30.0
MIN_CONFIDENCE_THRESHOLD = 0.5

# Load prompt from file
PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "extraction.txt"


def _load_prompt() -> str:
    """Load extraction prompt from file."""
    try:
        with open(PROMPT_PATH, encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {PROMPT_PATH}")
        raise RuntimeError("Extraction prompt not configured")


def _strip_exif(image_bytes: bytes) -> bytes:
    """
    Strip EXIF metadata from image bytes.
    
    Removes all metadata including location, device info, and timestamps
    before sending to external APIs for privacy protection.
    
    Args:
        image_bytes: Raw image data with potential EXIF metadata
        
    Returns:
        Clean image bytes without metadata
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary (removes some embedded profiles)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Create new image without EXIF data
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=95)
        output.seek(0)
        
        clean_bytes = output.getvalue()
        logger.info("EXIF metadata stripped successfully")
        return clean_bytes
        
    except Exception as e:
        logger.error(f"Failed to strip EXIF data: {e}")
        # Return original bytes if stripping fails
        return image_bytes


async def _extract_with_gemini(image_bytes: bytes, prompt: str) -> Optional[dict]:
    """
    Extract invoice data using Gemini Flash vision model.
    
    Args:
        image_bytes: Clean image bytes (EXIF stripped)
        prompt: Extraction prompt
        
    Returns:
        Parsed JSON response or None if extraction fails
    """
    try:
        genai.configure(api_key=None)  # Will be set from environment
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }
        
        # Run with timeout
        response = await asyncio.wait_for(
            asyncio.to_thread(
                model.generate_content,
                [prompt, image_part],
                generation_config=genai.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=4096,
                )
            ),
            timeout=GEMINI_TIMEOUT
        )
        
        # Parse JSON from response
        json_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if json_text.startswith("```"):
            json_text = json_text.strip("`").replace("json", "").strip()
        
        parsed_data = json.loads(json_text)
        
        logger.info("Gemini extraction successful")
        return parsed_data
        
    except asyncio.TimeoutError:
        logger.warning("Gemini API timeout")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"Gemini extraction failed: {e}")
        return None


async def _extract_with_groq(image_bytes: bytes, prompt: str) -> Optional[dict]:
    """
    Extract invoice data using Groq vision model (fallback).
    
    Args:
        image_bytes: Clean image bytes (EXIF stripped)
        prompt: Extraction prompt
        
    Returns:
        Parsed JSON response or None if extraction fails
    """
    try:
        client = Groq(api_key=None)  # Will be set from environment
        
        # Convert image to base64 for Groq
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        
        # Use llava-vision model for image understanding
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                    }
                ]
            }
        ]
        
        # Run with timeout
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.chat.completions.create,
                model="llava-v1.5-7b-4096-preview",
                messages=messages,
                temperature=0.1,
                max_tokens=4096,
            ),
            timeout=GROQ_TIMEOUT
        )
        
        # Parse JSON from response
        json_text = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if json_text.startswith("```"):
            json_text = json_text.strip("`").replace("json", "").strip()
        
        parsed_data = json.loads(json_text)
        
        logger.info("Groq extraction successful")
        return parsed_data
        
    except asyncio.TimeoutError:
        logger.warning("Groq API timeout")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"Groq extraction failed: {e}")
        return None


def _validate_confidence_score(data: dict) -> float:
    """
    Validate and normalize confidence score.
    
    Args:
        data: Parsed extraction data
        
    Returns:
        Validated confidence score in 0.0-1.0 range
    """
    score = data.get("confidence_score", 0.0)
    
    # Ensure score is numeric
    try:
        score = float(score)
    except (ValueError, TypeError):
        logger.warning(f"Invalid confidence score: {score}, defaulting to 0.0")
        score = 0.0
    
    # Clamp to valid range
    score = max(0.0, min(1.0, score))
    
    return score


async def extract_invoice(image_bytes: bytes, mime_type: str) -> InvoiceData:
    """
    Extract structured invoice data from image using AI.
    
    This is the main entry point for invoice extraction. It:
    1. Strips EXIF metadata for privacy
    2. Attempts extraction with Gemini Flash (primary)
    3. Falls back to Groq if Gemini fails or confidence is low
    4. Validates response against InvoiceData schema
    5. Returns structured invoice data with confidence score
    
    Args:
        image_bytes: Raw image data (PDF or image format)
        mime_type: MIME type of the input file
        
    Returns:
        Validated InvoiceData object
        
    Raises:
        ValueError: If extraction fails completely or validation errors occur
    """
    # Load extraction prompt
    prompt = _load_prompt()
    
    # Strip EXIF metadata for privacy
    clean_bytes = _strip_exif(image_bytes)
    
    # Try Gemini first
    gemini_result = await _extract_with_gemini(clean_bytes, prompt)
    
    # Check confidence and decide on fallback
    if gemini_result:
        confidence = _validate_confidence_score(gemini_result)
        
        # If confidence is too low, try Groq as fallback
        if confidence < MIN_CONFIDENCE_THRESHOLD:
            logger.info(f"Gemini confidence {confidence:.2f} below threshold, trying Groq")
            groq_result = await _extract_with_groq(clean_bytes, prompt)
            
            if groq_result:
                groq_confidence = _validate_confidence_score(groq_result)
                
                # Use Groq result if it has higher confidence
                if groq_confidence > confidence:
                    logger.info(f"Using Groq result (confidence: {groq_confidence:.2f})")
                    gemini_result = groq_result
    else:
        # Gemini failed completely, try Groq
        logger.warning("Gemini extraction failed, trying Groq fallback")
        gemini_result = await _extract_with_groq(clean_bytes, prompt)
    
    # Validate we have some result
    if not gemini_result:
        raise ValueError(
            "Failed to extract invoice data. "
            "Please try with a clearer scan or higher quality image."
        )
    
    # Validate against Pydantic model
    try:
        invoice_data = InvoiceData.model_validate(gemini_result)
        logger.info(
            f"Extraction successful with confidence: {invoice_data.confidence_score:.2f}"
        )
        return invoice_data
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise ValueError(
            f"Extracted data validation failed: {str(e)}. "
            "The invoice structure may be non-standard."
        )
