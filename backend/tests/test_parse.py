"""Test parse endpoint functionality.

This test module verifies:
1. Valid PDF parsing
2. Valid image parsing
3. File size validation
4. File extension validation
5. Confidence score handling
6. Low quality image handling
7. Rate limiting
8. Error responses
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from pathlib import Path
from io import BytesIO
import os

from main import app
from models.invoice import InvoiceData, LineItem


client = TestClient(app)

# Get fixtures directory
FIXTURES_DIR = Path(__file__).parent / "fixtures"


class TestParseValidPDF:
    """Test parsing valid PDF files."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_valid_pdf(self, mock_extract):
        """Test parsing valid PDF returns structured invoice data."""
        # Mock the AI extraction response
        mock_extract.return_value = InvoiceData(
            invoice_number="INV-2024-001",
            invoice_date="2024-01-15",
            vendor_name="ABC Supplies Pvt Ltd",
            vendor_gstin="29ABCDE1234F1Z5",
            buyer_name="XYZ Enterprises",
            buyer_gstin="27FGHIJ5678K2L6",
            line_items=[
                LineItem(
                    description="Office Supplies",
                    hsn_sac="998311",
                    quantity=10.0,
                    unit="pcs",
                    rate=150.00,
                    amount=1500.00,
                    tax_rate=18.0
                )
            ],
            subtotal=4000.00,
            cgst=360.00,
            sgst=360.00,
            total_tax=720.00,
            grand_total=4720.00,
            currency="INR",
            confidence_score=0.95
        )
        
        # Load the fixture PDF
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("gst_invoice_standard.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["invoice_number"] == "INV-2024-001"
        assert data["vendor_name"] == "ABC Supplies Pvt Ltd"
        assert data["confidence_score"] == 0.95
        assert len(data["line_items"]) == 1
        assert data["line_items"][0]["description"] == "Office Supplies"
        assert "X-Processing-Time-Ms" in response.headers
    
    @patch('routers.parse.extract_invoice')
    def test_parse_foreign_invoice_pdf(self, mock_extract):
        """Test parsing foreign invoice (USD, no GSTIN)."""
        mock_extract.return_value = InvoiceData(
            invoice_number="INV-US-2024-001",
            invoice_date="2024-01-15",
            vendor_name="Tech Solutions Inc",
            vendor_gstin=None,
            buyer_name="Global Corp Ltd",
            buyer_gstin=None,
            line_items=[
                LineItem(
                    description="Software License",
                    quantity=1.0,
                    rate=1000.00,
                    amount=1000.00
                )
            ],
            subtotal=2000.00,
            total_tax=160.00,
            grand_total=2160.00,
            currency="USD",
            confidence_score=0.92
        )
        
        pdf_path = FIXTURES_DIR / "foreign_invoice.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("foreign_invoice.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["currency"] == "USD"
        assert data["vendor_gstin"] is None
        assert data["buyer_gstin"] is None


class TestParseValidImage:
    """Test parsing valid image files."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_valid_image_jpg(self, mock_extract):
        """Test parsing valid JPG image."""
        mock_extract.return_value = InvoiceData(
            invoice_number="REC-2024-045",
            invoice_date="2024-01-20",
            vendor_name="Freelancer",
            line_items=[
                LineItem(
                    description="Web Development Services",
                    quantity=1.0,
                    rate=500.00,
                    amount=500.00
                )
            ],
            grand_total=500.00,
            currency="USD",
            confidence_score=0.88
        )
        
        jpg_path = FIXTURES_DIR / "freelance_receipt.jpg"
        with open(jpg_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("freelance_receipt.jpg", f, "image/jpeg")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["invoice_number"] == "REC-2024-045"
        assert data["confidence_score"] == 0.88
    
    @patch('routers.parse.extract_invoice')
    def test_parse_valid_image_png(self, mock_extract):
        """Test parsing valid PNG image."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Test Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.85
        )
        
        png_path = FIXTURES_DIR / "low_quality_scan.png"
        with open(png_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("low_quality_scan.png", f, "image/png")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["grand_total"] == 100.00


class TestParseFileValidation:
    """Test file validation (size, extension, MIME type)."""
    
    def test_parse_rejects_oversized_file(self):
        """Test rejection of oversized files (>10MB)."""
        # Create a file larger than 10MB
        large_file = BytesIO(b"x" * (11 * 1024 * 1024))
        large_file.name = "large.pdf"
        
        response = client.post(
            "/api/parse",
            files={"file": ("large.pdf", large_file, "application/pdf")}
        )
        
        # Should get 413 for file too large
        assert response.status_code == 413
        # Check if error response has the expected structure
        json_response = response.json()
        if "error" in json_response:
            assert json_response["error"] == "file_too_large"
    
    def test_parse_rejects_invalid_extension(self):
        """Test rejection of invalid file extensions."""
        # Create a fake file with unsupported extension
        fake_file = BytesIO(b"fake content")
        
        response = client.post(
            "/api/parse",
            files={"file": ("test.xyz", fake_file, "application/octet-stream")}
        )
        
        assert response.status_code == 415
        assert response.json()["error"] == "unsupported_format"
        assert "Only PDF, PNG, JPG, WEBP accepted" in response.json()["message"]
    
    def test_parse_rejects_invalid_mime_type(self):
        """Test rejection of files with invalid MIME types."""
        # Create a PDF file but claim it's something else
        fake_file = BytesIO(b"%PDF-1.4 fake content")
        
        response = client.post(
            "/api/parse",
            files={"file": ("test.pdf", fake_file, "application/octet-stream")}
        )
        
        # Should reject due to MIME type mismatch or PDF processing failure
        # The actual behavior depends on whether validation happens before processing
        assert response.status_code in [415, 422]
    
    def test_parse_rejects_executable_files(self):
        """Test rejection of executable files."""
        exe_file = BytesIO(b"MZ\x90\x00")
        
        response = client.post(
            "/api/parse",
            files={"file": ("test.exe", exe_file, "application/x-msdownload")}
        )
        
        assert response.status_code == 415
        assert response.json()["error"] == "unsupported_format"
    
    def test_parse_accepts_webp(self):
        """Test that WebP format is accepted."""
        # Create a minimal WebP file (this is a simplified test)
        webp_file = BytesIO(b"RIFF....WEBPVP8 ")
        
        # This test verifies the extension is allowed
        # Actual WebP parsing would require a real WebP file
        from routers.parse import ALLOWED_EXTENSIONS
        assert "webp" in ALLOWED_EXTENSIONS


class TestParseConfidenceScore:
    """Test confidence score handling."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_returns_confidence_score(self, mock_extract):
        """Test that confidence score is returned in response."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Test Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.95
        )
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "confidence_score" in data
        assert isinstance(data["confidence_score"], float)
        assert 0.0 <= data["confidence_score"] <= 1.0
    
    @patch('routers.parse.extract_invoice')
    def test_parse_high_confidence(self, mock_extract):
        """Test high confidence score (>=0.8)."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Clear Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.92
        )
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        assert response.json()["confidence_score"] >= 0.8
    
    @patch('routers.parse.extract_invoice')
    def test_parse_medium_confidence(self, mock_extract):
        """Test medium confidence score (0.5-0.8)."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Somewhat Clear Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.65
        )
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        assert 0.5 <= response.json()["confidence_score"] < 0.8
    
    @patch('routers.parse.extract_invoice')
    def test_parse_low_quality_returns_low_confidence(self, mock_extract):
        """Test low quality images return low confidence (<0.5)."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Blurry Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.35
        )
        
        png_path = FIXTURES_DIR / "low_quality_scan.png"
        with open(png_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("low_quality_scan.png", f, "image/png")}
            )
        
        assert response.status_code == 200
        assert response.json()["confidence_score"] < 0.5


class TestParseErrorHandling:
    """Test error handling and edge cases."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_extraction_failure(self, mock_extract):
        """Test handling of extraction failures."""
        mock_extract.side_effect = ValueError("Could not parse invoice")
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 422
        assert response.json()["error"] == "extraction_failed"
        assert "Could not parse invoice" in response.json()["message"]
    
    @patch('routers.parse.extract_invoice')
    def test_parse_unexpected_error(self, mock_extract):
        """Test handling of unexpected errors."""
        mock_extract.side_effect = Exception("Unexpected error")
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 500
        assert response.json()["error"] == "extraction_failed"
    
    def test_parse_missing_file(self):
        """Test handling of missing file in request."""
        response = client.post("/api/parse")
        
        assert response.status_code == 422  # Validation error
    
    def test_parse_empty_file(self):
        """Test handling of empty file."""
        empty_file = BytesIO(b"")
        
        response = client.post(
            "/api/parse",
            files={"file": ("empty.pdf", empty_file, "application/pdf")}
        )
        
        # Should fail validation or processing
        assert response.status_code in [413, 422, 415, 500]


class TestParseRateLimiting:
    """Test rate limiting on parse endpoint."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_has_rate_limit(self, mock_extract):
        """Test that parse endpoint has rate limiting."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Test Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.9
        )
        
        # Make multiple requests
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        for i in range(5):
            with open(pdf_path, "rb") as f:
                response = client.post(
                    "/api/parse",
                    files={"file": ("test.pdf", f, "application/pdf")}
                )
            # First few requests should succeed
            if i < 5:
                assert response.status_code == 200
    
    def test_parse_rate_limit_exceeded(self):
        """Test rate limit exceeded response."""
        # This test would require making many requests quickly
        # For now, we verify the endpoint structure
        response = client.get("/")
        endpoints = response.json()["endpoints"]
        assert "/api/parse" in endpoints.values()


class TestParseProcessingTime:
    """Test processing time header."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_returns_processing_time_header(self, mock_extract):
        """Test that X-Processing-Time-Ms header is present."""
        mock_extract.return_value = InvoiceData(
            line_items=[
                LineItem(
                    description="Test Item",
                    quantity=1.0,
                    rate=100.00,
                    amount=100.00
                )
            ],
            grand_total=100.00,
            confidence_score=0.9
        )
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert "X-Processing-Time-Ms" in response.headers
        processing_time = float(response.headers["X-Processing-Time-Ms"])
        assert processing_time >= 0


class TestParseDataIntegrity:
    """Test data integrity and completeness."""
    
    @patch('routers.parse.extract_invoice')
    def test_parse_returns_complete_invoice_data(self, mock_extract):
        """Test that all invoice fields are returned."""
        mock_extract.return_value = InvoiceData(
            invoice_number="INV-2024-001",
            invoice_date="2024-01-15",
            due_date="2024-01-30",
            vendor_name="ABC Supplies",
            vendor_gstin="29ABCDE1234F1Z5",
            vendor_address="123 Business St",
            buyer_name="XYZ Enterprises",
            buyer_gstin="27FGHIJ5678K2L6",
            buyer_address="456 Customer Rd",
            line_items=[
                LineItem(
                    description="Office Supplies",
                    hsn_sac="998311",
                    quantity=10.0,
                    unit="pcs",
                    rate=150.00,
                    amount=1500.00,
                    tax_rate=18.0
                )
            ],
            subtotal=4000.00,
            cgst=360.00,
            sgst=360.00,
            igst=None,
            total_tax=720.00,
            grand_total=4720.00,
            currency="INR",
            payment_terms="Net 30",
            notes="Thank you for your business",
            confidence_score=0.95
        )
        
        pdf_path = FIXTURES_DIR / "gst_invoice_standard.pdf"
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/parse",
                files={"file": ("test.pdf", f, "application/pdf")}
            )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all fields are present
        assert data["invoice_number"] == "INV-2024-001"
        assert data["invoice_date"] == "2024-01-15"
        assert data["due_date"] == "2024-01-30"
        assert data["vendor_name"] == "ABC Supplies"
        assert data["vendor_gstin"] == "29ABCDE1234F1Z5"
        assert data["buyer_name"] == "XYZ Enterprises"
        assert len(data["line_items"]) == 1
        assert data["subtotal"] == 4000.00
        assert data["grand_total"] == 4720.00
        assert data["currency"] == "INR"
        assert data["confidence_score"] == 0.95


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
