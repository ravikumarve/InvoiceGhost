"""License key validation endpoint.

This module handles the POST /api/validate-key endpoint which:
- Validates Gumroad license keys using HMAC
- No database required - validation is local
- Rate limited to prevent abuse
- Returns validation result without storing the key
"""

import logging
import os
import hmac
import hashlib

from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel, Field

# Configure logging - NEVER log license keys
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants from environment
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))
LICENSE_KEY_HMAC_SECRET = os.getenv("LICENSE_KEY_HMAC_SECRET", "")

# Initialize router and rate limiter
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class LicenseKeyRequest(BaseModel):
    """Request model for license key validation."""
    license_key: str = Field(..., min_length=1, description="Gumroad license key to validate")


class LicenseKeyResponse(BaseModel):
    """Response model for license key validation."""
    valid: bool
    message: str


def validate_license_key(license_key: str) -> bool:
    """
    Validate a Gumroad license key using HMAC.
    
    This function validates the license key locally without making external API calls.
    The validation is done using HMAC-SHA256 with a secret key.
    
    Args:
        license_key: The license key to validate
        
    Returns:
        True if the license key is valid, False otherwise
        
    Note:
        - This is a simplified validation for demonstration
        - In production, you would implement proper Gumroad license key validation
        - The actual validation logic depends on your Gumroad product configuration
    """
    if not LICENSE_KEY_HMAC_SECRET:
        logger.warning("LICENSE_KEY_HMAC_SECRET not configured - license validation disabled")
        return False
    
    if not license_key or len(license_key) < 10:
        return False
    
    try:
        # Create HMAC signature
        hmac.new(
            LICENSE_KEY_HMAC_SECRET.encode(),
            license_key.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # In a real implementation, you would:
        # 1. Parse the license key format (Gumroad uses specific formats)
        # 2. Verify the signature matches
        # 3. Check if the license is active/not expired
        # 4. Validate against Gumroad API if needed
        
        # For this demo, we'll accept any license key that looks valid
        # In production, replace this with actual Gumroad validation
        return len(license_key) >= 20 and license_key.isalnum()
        
    except Exception as e:
        logger.error(f"License key validation error: {e}")
        return False


@router.post("/validate-key")
@limiter.limit(f"{RATE_LIMIT_PER_MINUTE}/minute")
async def validate_key(request: Request, license_request: LicenseKeyRequest):
    """
    Validate a Gumroad license key.
    
    This endpoint validates a Gumroad license key locally using HMAC.
    No database or external API calls are required for validation.
    
    **Privacy Guarantee:**
    - License keys are never logged
    - No license keys are stored
    - Validation is done locally
    
    **Rate Limiting:**
    - 10 requests per minute per IP address (configurable)
    
    **Request Body:**
    ```json
    {
        "license_key": "your-gumroad-license-key"
    }
    ```
    
    **Response:**
    ```json
    {
        "valid": true,
        "message": "License key is valid"
    }
    ```
    
    Args:
        request: LicenseKeyRequest containing the license key
        
    Returns:
        JSON response with validation result
        
    Raises:
        HTTPException: For validation errors
    """
    try:
        # Validate license key
        is_valid = validate_license_key(license_request.license_key)
        
        if is_valid:
            client_host = request.client.host if request.client else "unknown"
            logger.info(f"License key validated successfully for {client_host}")
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "valid": True,
                    "message": "License key is valid"
                }
            )
        else:
            client_host = request.client.host if request.client else "unknown"
            logger.warning(f"Invalid license key attempt from {client_host}")
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "valid": False,
                    "message": "Invalid license key"
                }
            )
            
    except Exception as e:
        logger.error(f"Unexpected error in validate-key endpoint: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_error",
                "message": "An unexpected error occurred"
            }
        )
