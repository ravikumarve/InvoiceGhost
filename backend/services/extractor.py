"""AI-powered invoice extraction service with Gemini Flash and Groq fallback.

Architecture:
1. Strip EXIF metadata for privacy
2. Attempt Gemini Flash (primary) with proper API key init
3. Fall back to Groq if Gemini fails or confidence is low
4. Repair common JSON malformation from AI responses
5. Validate against InvoiceData Pydantic schema
"""

import asyncio
import base64
import io
import json
import logging
import os
import re
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
GEMINI_MODEL = "gemini-2.0-flash"  # Updated from deprecated 1.5-flash
GEMINI_TIMEOUT = 30.0
GROQ_TIMEOUT = 30.0
GROQ_MODEL = "llama-3.2-90b-vision-preview"  # Updated from deprecated llava
MIN_CONFIDENCE_THRESHOLD = 0.5

# API keys from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

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
        
        # Convert to RGB if necessary (removes alpha channel and embedded profiles)
        if image.mode in ("RGBA", "P", "LA", "PA"):
            # Create white background for transparency
            background = Image.new("RGB", image.size, (255, 255, 255))
            if image.mode == "P":
                image = image.convert("RGBA")
            if "A" in image.mode:
                background.paste(image, mask=image.split()[-1])
                image = background
            else:
                image = image.convert("RGB")
        elif image.mode != "RGB":
            image = image.convert("RGB")
        
        # Create new image without EXIF data — always re-encode as JPEG
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=95)
        output.seek(0)
        
        clean_bytes = output.getvalue()
        logger.info(f"EXIF stripped: {len(image_bytes)} → {len(clean_bytes)} bytes")
        return clean_bytes
        
    except Exception as e:
        logger.error(f"Failed to strip EXIF data: {e}")
        # Return original bytes if stripping fails — better than crashing
        return image_bytes


def _repair_json(text: str) -> str:
    """
    Attempt to repair common JSON malformations from AI output.
    
    Handles:
    - Trailing commas
    - Single quotes instead of double quotes
    - Comments (// and /* */)
    - Missing closing braces
    - NaN/Infinity values (not valid in JSON)
    - Markdown code fences
    """
    # Remove markdown code fences
    text = text.strip()
    if text.startswith("```"):
        # Remove opening fence with optional language tag
        text = re.sub(r'^```[a-zA-Z]*\n?', '', text)
        text = re.sub(r'\n?```$', '', text)
    text = text.strip()
    
    # Remove single-line comments
    text = re.sub(r'//.*?$', '', text, flags=re.MULTILINE)
    
    # Remove multi-line comments
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    
    # Replace single quotes with double quotes (careful with nested)
    # Only replace quotes that are acting as JSON string delimiters
    text = re.sub(r"(?<!\\)'", '"', text)
    
    # Remove trailing commas before } or ]
    text = re.sub(r',\s*([}\]])', r'\1', text)
    
    # Replace NaN/Infinity with null
    text = re.sub(r'\bNaN\b', 'null', text)
    text = re.sub(r'\bInfinity\b', 'null', text)
    text = re.sub(r'\b-Infinity\b', 'null', text)
    
    # Attempt to fix missing closing braces/brackets
    open_braces = text.count('{') - text.count('}')
    open_brackets = text.count('[') - text.count(']')
    if open_braces > 0:
        text += '}' * open_braces
    if open_brackets > 0:
        text += ']' * open_brackets
    
    return text


async def _extract_with_gemini(image_bytes: bytes, prompt: str) -> Optional[dict]:
    """
    Extract invoice data using Gemini Flash vision model.
    
    Args:
        image_bytes: Clean image bytes (EXIF stripped)
        prompt: Extraction prompt
        
    Returns:
        Parsed JSON response or None if extraction fails
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set, skipping Gemini extraction")
        return None
    
    try:
        # Configure API key properly
        genai.configure(api_key=GEMINI_API_KEY)
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Create image part for Gemini
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }
        
        # Run with timeout in a thread (Gemini SDK is synchronous)
        response = await asyncio.wait_for(
            asyncio.to_thread(
                model.generate_content,
                [prompt, image_part],
                generation_config=genai.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=4096,
                    response_mime_type="application/json",  # Force JSON output
                )
            ),
            timeout=GEMINI_TIMEOUT
        )
        
        # Check for blocked/empty responses
        if not response.candidates or not response.candidates[0].content:
            logger.warning("Gemini returned empty or blocked response")
            return None
        
        # Parse JSON from response
        json_text = response.text.strip()
        json_text = _repair_json(json_text)
        
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
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set, skipping Groq extraction")
        return None
    
    try:
        # Initialize client with API key
        client = Groq(api_key=GROQ_API_KEY)
        
        # Convert image to base64 for Groq
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        
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
        
        # Run with timeout in a thread (Groq SDK is synchronous)
        response = await asyncio.wait_for(
            asyncio.to_thread(
                client.chat.completions.create,
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.1,
                max_tokens=4096,
                response_format={"type": "json_object"},  # Force JSON output
            ),
            timeout=GROQ_TIMEOUT
        )
        
        # Parse JSON from response
        json_text = response.choices[0].message.content.strip()
        json_text = _repair_json(json_text)
        
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
    result = await _extract_with_gemini(clean_bytes, prompt)
    
    # Check confidence and decide on fallback
    if result:
        confidence = _validate_confidence_score(result)
        
        # If confidence is too low, try Groq as fallback
        if confidence < MIN_CONFIDENCE_THRESHOLD:
            logger.info(f"Gemini confidence {confidence:.2f} below threshold, trying Groq")
            groq_result = await _extract_with_groq(clean_bytes, prompt)
            
            if groq_result:
                groq_confidence = _validate_confidence_score(groq_result)
                
                # Use Groq result if it has higher confidence
                if groq_confidence > confidence:
                    logger.info(f"Using Groq result (confidence: {groq_confidence:.2f})")
                    result = groq_result
    else:
        # Gemini failed completely, try Groq
        logger.warning("Gemini extraction failed, trying Groq fallback")
        result = await _extract_with_groq(clean_bytes, prompt)
    
    # Validate we have some result
    if not result:
        raise ValueError(
            "Failed to extract invoice data. "
            "Please try with a clearer scan or higher quality image."
        )
    
    # Ensure line_items exists and is a list
    if "line_items" not in result or not isinstance(result.get("line_items"), list):
        result["line_items"] = [{"description": "Unknown item"}]
    
    # Ensure at least one line item
    if len(result["line_items"]) == 0:
        result["line_items"] = [{"description": "Unknown item"}]
    
    # Validate against Pydantic model
    try:
        invoice_data = InvoiceData.model_validate(result)
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
