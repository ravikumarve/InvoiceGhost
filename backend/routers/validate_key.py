"""License key validation endpoint.

This module handles the POST /api/validate-key endpoint which:
- Validates Gumroad license keys using HMAC-SHA256
- Uses constant-time comparison to prevent timing attacks
- No database required — validation is local
- Rate limited to prevent brute force
- Returns validation result without storing the key

Security model:
- A known set of valid license key hashes is pre-computed from the HMAC secret
- The server computes HMAC-SHA256(secret, license_key) and compares
  against the expected hash using constant-time comparison
- This prevents timing side-channel attacks
"""

import logging
import os
import hmac
import hashlib

from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Configure logging - NEVER log license keys
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants from environment
LICENSE_KEY_HMAC_SECRET = os.getenv("LICENSE_KEY_HMAC_SECRET", "")

# Initialize router — NO duplicate limiter (uses app-level SlowAPIMiddleware)
router = APIRouter()

# Minimum license key length to prevent trivial brute force
MIN_KEY_LENGTH = 20


class LicenseKeyRequest(BaseModel):
    """Request model for license key validation."""
    license_key: str = Field(
        ..., 
        min_length=1, 
        max_length=256,  # Prevent absurdly long keys
        description="Gumroad license key to validate"
    )


class LicenseKeyResponse(BaseModel):
    """Response model for license key validation."""
    valid: bool
    message: str


def _compute_hmac(key: str) -> str:
    """Compute HMAC-SHA256 of a license key using the secret.
    
    Args:
        key: The license key string
        
    Returns:
        Hex digest of HMAC-SHA256
    """
    return hmac.new(
        LICENSE_KEY_HMAC_SECRET.encode(),
        key.encode(),
        hashlib.sha256
    ).hexdigest()


def validate_license_key(license_key: str) -> bool:
    """
    Validate a Gumroad license key using HMAC with constant-time comparison.
    
    The validation flow:
    1. Check HMAC secret is configured
    2. Check minimum key length
    3. Compute HMAC-SHA256(secret, license_key)
    4. Compare against known valid hashes using constant-time comparison
    
    To add valid license keys:
    - Run: python -c "import hmac, hashlib; print(hmac.new(b'YOUR_SECRET', b'LICENSE_KEY', hashlib.sha256).hexdigest())"
    - Add the hash to VALID_KEY_HASHES below
    
    Args:
        license_key: The license key to validate
        
    Returns:
        True if the license key is valid, False otherwise
    """
    if not LICENSE_KEY_HMAC_SECRET:
        logger.warning("LICENSE_KEY_HMAC_SECRET not configured - license validation disabled")
        return False
    
    if not license_key or len(license_key) < MIN_KEY_LENGTH:
        return False
    
    # Pre-computed valid key hashes (add your Gumroad license key hashes here)
    # Generate with: python -c "import hmac, hashlib; print(hmac.new(b'YOUR_SECRET', b'YOUR_KEY', hashlib.sha256).hexdigest())"
    VALID_KEY_HASHES = set(
        h.strip() 
        for h in os.getenv("VALID_LICENSE_HASHES", "").split(",") 
        if h.strip()
    )
    
    if not VALID_KEY_HASHES:
        # No valid hashes configured — cannot validate any key
        logger.warning("No VALID_LICENSE_HASHES configured - no keys can be validated")
        return False
    
    # Compute HMAC of the provided key
    computed_hash = _compute_hmac(license_key)
    
    # Constant-time comparison against each valid hash
    for valid_hash in VALID_KEY_HASHES:
        if hmac.compare_digest(computed_hash, valid_hash):
            return True
    
    return False


@router.post("/validate-key")
async def validate_key(request: Request, license_request: LicenseKeyRequest):
    """
    Validate a Gumroad license key.
    
    This endpoint validates a Gumroad license key locally using HMAC.
    No database or external API calls are required for validation.
    
    **Privacy Guarantee:**
    - License keys are never logged
    - No license keys are stored
    - Validation is done locally
    
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
