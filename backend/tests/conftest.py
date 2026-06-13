"""Shared test configuration and fixtures.

This conftest provides:
1. Rate-limit bypass for test mode (TESTING env var)
2. Shared TestClient with proper lifecycle
3. Common test fixtures
"""

import os
import pytest
from fastapi.testclient import TestClient

# Set testing mode BEFORE importing app
# This disables rate limiting in the application
os.environ["TESTING"] = "1"
os.environ["RATE_LIMIT_PER_MINUTE"] = "1000"
os.environ["MAX_FILE_SIZE_MB"] = "10"
os.environ["LICENSE_KEY_HMAC_SECRET"] = "test-secret-key-for-testing-only"

from main import app


@pytest.fixture(scope="session")
def client():
    """Shared TestClient for all tests — rate limits bypassed."""
    return TestClient(app)
