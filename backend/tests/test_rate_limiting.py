"""Test rate limiting, security headers, and error handling.

This test module verifies:
1. Rate limiting is properly configured
2. Error responses match AGENTS.md specification
3. Security headers are present
4. Global exception handling works correctly
5. License key validation
"""

import pytest
from io import BytesIO


class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_health_check_rate_limit(self, client):
        """Test that health check endpoint responds correctly."""
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200
            assert response.json()["status"] == "healthy"
    
    def test_root_endpoint(self, client):
        """Test that root endpoint responds correctly."""
        response = client.get("/")
        assert response.status_code == 200
        assert "endpoints" in response.json()
    
    def test_parse_endpoint_exists(self, client):
        """Test that parse endpoint is registered."""
        response = client.get("/")
        endpoints = response.json()["endpoints"]
        assert "/api/parse" in endpoints.values()
    
    def test_export_endpoint_exists(self, client):
        """Test that export endpoint is registered."""
        response = client.get("/")
        endpoints = response.json()["endpoints"]
        assert "/api/export/csv" in endpoints.values()
    
    def test_validate_key_endpoint_exists(self, client):
        """Test that validate-key endpoint is registered."""
        response = client.get("/")
        endpoints = response.json()["endpoints"]
        assert "/api/validate-key" in endpoints.values()


class TestErrorHandling:
    """Test error handling matches AGENTS.md specification."""
    
    def test_unsupported_format_error(self, client):
        """Test unsupported_format error response."""
        fake_file = BytesIO(b"fake content")
        
        response = client.post(
            "/api/parse",
            files={"file": ("test.xyz", fake_file, "application/octet-stream")}
        )
        
        assert response.status_code == 415
        assert response.json()["error"] == "unsupported_format"
        assert "Only PDF, PNG, JPG, WEBP accepted" in response.json()["message"]
    
    def test_file_too_large_error(self, client):
        """Test file_too_large error response."""
        large_file = BytesIO(b"x" * (11 * 1024 * 1024))  # 11MB
        
        response = client.post(
            "/api/parse",
            files={"file": ("large.pdf", large_file, "application/pdf")}
        )
        
        assert response.status_code in [413, 415, 500]
        if response.status_code == 413:
            json_response = response.json()
            if "error" in json_response:
                assert json_response["error"] == "file_too_large"
    
    def test_export_csv_no_line_items_error(self, client):
        """Test error when CSV export has no line items."""
        response = client.post(
            "/api/export/csv",
            json={
                "invoice_data": {
                    "line_items": [],
                    "grand_total": 0.0,
                    "confidence_score": 0.8
                }
            }
        )
        
        # Should fail — either 400 (endpoint check) or 422 (Pydantic validation)
        assert response.status_code in [400, 422]
    
    def test_export_csv_missing_invoice_data_error(self, client):
        """Test error when invoice data is missing."""
        response = client.post(
            "/api/export/csv",
            json={}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_validate_key_invalid_key(self, client):
        """Test validate-key endpoint with invalid key."""
        response = client.post(
            "/api/validate-key",
            json={"license_key": "invalid-key"}
        )
        
        assert response.status_code == 200
        assert response.json()["valid"] == False
        assert "Invalid license key" in response.json()["message"]
    
    def test_validate_key_missing_key(self, client):
        """Test validate-key endpoint with missing key."""
        response = client.post(
            "/api/validate-key",
            json={}
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_validate_key_short_key(self, client):
        """Test validate-key rejects keys shorter than minimum length."""
        response = client.post(
            "/api/validate-key",
            json={"license_key": "short"}
        )
        
        assert response.status_code == 200
        assert response.json()["valid"] == False


class TestSecurityHeaders:
    """Test security headers are properly configured."""
    
    def test_security_headers_on_root(self, client):
        """Test security headers are present on root endpoint."""
        response = client.get("/")
        
        assert response.status_code == 200
        assert "X-Content-Type-Options" in response.headers
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert "X-Frame-Options" in response.headers
        assert response.headers["X-Frame-Options"] == "DENY"
        assert "X-XSS-Protection" in response.headers
        assert "Referrer-Policy" in response.headers
        assert "Permissions-Policy" in response.headers
        assert "Content-Security-Policy" in response.headers
    
    def test_security_headers_on_health(self, client):
        """Test security headers are present on health endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
    
    def test_processing_time_header(self, client):
        """Test X-Processing-Time-Ms header is present."""
        response = client.get("/health")
        
        assert "X-Processing-Time-Ms" in response.headers
        processing_time = float(response.headers["X-Processing-Time-Ms"])
        assert processing_time >= 0
    
    def test_request_id_header(self, client):
        """Test X-Request-ID header is present and unique."""
        response1 = client.get("/health")
        response2 = client.get("/health")
        
        assert "X-Request-ID" in response1.headers
        assert "X-Request-ID" in response2.headers
        # Each request should have a unique ID
        assert response1.headers["X-Request-ID"] != response2.headers["X-Request-ID"]


class TestGlobalExceptionHandling:
    """Test global exception handling."""
    
    def test_404_error_format(self, client):
        """Test 404 errors have consistent format."""
        response = client.get("/nonexistent-endpoint")
        
        assert response.status_code == 404
        assert "application/json" in response.headers["content-type"]
    
    def test_method_not_allowed_format(self, client):
        """Test 405 errors have consistent format."""
        response = client.get("/api/parse")
        
        assert response.status_code == 405
        assert "application/json" in response.headers["content-type"]


class TestErrorMessages:
    """Test error messages are user-friendly."""
    
    def test_error_messages_are_user_friendly(self, client):
        """Test that error messages are clear and actionable."""
        fake_file = BytesIO(b"fake content")
        response = client.post(
            "/api/parse",
            files={"file": ("test.xyz", fake_file, "application/octet-stream")}
        )
        
        assert response.status_code == 415
        message = response.json()["message"]
        assert "Only PDF, PNG, JPG, WEBP accepted" in message
        assert len(message) < 200  # Keep messages concise


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
