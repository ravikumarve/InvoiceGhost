import pytest
from fastapi.testclient import TestClient
from main import app
from models.invoice import InvoiceData, LineItem


client = TestClient(app)


@pytest.fixture
def sample_invoice_data():
    """Sample invoice data for testing."""
    return InvoiceData(
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
            ),
            LineItem(
                description="Computer Accessories",
                hsn_sac="847330",
                quantity=5.0,
                unit="pcs",
                rate=500.00,
                amount=2500.00,
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
        confidence_score=0.95
    )


@pytest.fixture
def minimal_invoice_data():
    """Minimal invoice data for testing."""
    return InvoiceData(
        line_items=[
            LineItem(
                description="Test Item",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            )
        ],
        grand_total=100.00,
        confidence_score=0.8
    )


def test_export_csv_success(sample_invoice_data):
    """Test successful CSV export."""
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": sample_invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment" in response.headers["content-disposition"]
    assert "invoice_INV-2024-001.csv" in response.headers["content-disposition"]
    
    # Verify CSV content
    csv_content = response.text
    assert "Description" in csv_content
    assert "HSN/SAC" in csv_content
    assert "Office Supplies" in csv_content
    assert "Computer Accessories" in csv_content
    assert "₹4,000.00" in csv_content or "4,000.00" in csv_content
    assert "₹4,720.00" in csv_content or "4,720.00" in csv_content


def test_export_csv_minimal_data(minimal_invoice_data):
    """Test CSV export with minimal invoice data."""
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": minimal_invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    assert "attachment" in response.headers["content-disposition"]
    assert "invoice_unknown.csv" in response.headers["content-disposition"]
    
    csv_content = response.text
    assert "Description" in csv_content
    assert "Test Item" in csv_content


def test_export_csv_no_invoice_number():
    """Test CSV export when invoice number is missing."""
    invoice_data = InvoiceData(
        line_items=[
            LineItem(
                description="Test Item",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            )
        ],
        grand_total=100.00,
        confidence_score=0.8
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    assert "invoice_unknown.csv" in response.headers["content-disposition"]


def test_export_csv_special_characters():
    """Test CSV export with special characters in description."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-002",
        line_items=[
            LineItem(
                description='Item with "quotes" and, commas',
                quantity=1.0,
                rate=100.00,
                amount=100.00
            )
        ],
        grand_total=100.00,
        confidence_score=0.8
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    assert "quotes" in csv_content


def test_export_csv_no_line_items():
    """Test CSV export with no line items (should fail)."""
    invoice_data = InvoiceData(
        line_items=[],
        grand_total=0.00,
        confidence_score=0.8
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 400
    assert "line item" in response.json()["detail"]["message"].lower()


def test_export_csv_missing_invoice_data():
    """Test CSV export with missing invoice data (should fail)."""
    response = client.post(
        "/api/export/csv",
        json={}
    )
    
    assert response.status_code == 422  # Validation error


def test_export_csv_igst_only():
    """Test CSV export with IGST only (no CGST/SGST)."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-003",
        line_items=[
            LineItem(
                description="Inter-state Supply",
                hsn_sac="998311",
                quantity=1.0,
                unit="pcs",
                rate=1000.00,
                amount=1000.00,
                tax_rate=18.0
            )
        ],
        subtotal=1000.00,
        cgst=None,
        sgst=None,
        igst=180.00,
        total_tax=180.00,
        grand_total=1180.00,
        currency="INR",
        confidence_score=0.9
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    assert "IGST:" in csv_content
    assert "₹180.00" in csv_content or "180.00" in csv_content


def test_export_csv_indian_number_formatting():
    """Test that numbers are formatted with proper grouping."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-004",
        line_items=[
            LineItem(
                description="High Value Item",
                quantity=1.0,
                rate=100000.00,
                amount=100000.00
            )
        ],
        subtotal=100000.00,
        grand_total=100000.00,
        currency="INR",
        confidence_score=0.85
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    # Standard number formatting with commas
    assert "100,000.00" in csv_content


def test_csv_export_has_correct_headers():
    """Test CSV has correct headers."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-005",
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
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Verify all expected headers are present
    expected_headers = [
        "Description",
        "HSN/SAC",
        "Qty",
        "Unit",
        "Rate",
        "Amount",
        "Tax Rate"
    ]
    
    for header in expected_headers:
        assert header in csv_content


def test_csv_export_line_items_match_input():
    """Test line items match input data."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-006",
        line_items=[
            LineItem(
                description="First Item",
                hsn_sac="998311",
                quantity=5.0,
                unit="pcs",
                rate=200.00,
                amount=1000.00,
                tax_rate=18.0
            ),
            LineItem(
                description="Second Item",
                hsn_sac="847330",
                quantity=3.0,
                unit="pcs",
                rate=300.00,
                amount=900.00,
                tax_rate=18.0
            ),
            LineItem(
                description="Third Item",
                hsn_sac="998312",
                quantity=2.0,
                unit="kg",
                rate=150.00,
                amount=300.00,
                tax_rate=12.0
            )
        ],
        subtotal=2200.00,
        grand_total=2200.00,
        confidence_score=0.88
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Verify all line items are present
    assert "First Item" in csv_content
    assert "Second Item" in csv_content
    assert "Third Item" in csv_content
    
    # Verify HSN/SAC codes
    assert "998311" in csv_content
    assert "847330" in csv_content
    assert "998312" in csv_content
    
    # Verify quantities
    assert "5.00" in csv_content
    assert "3.00" in csv_content
    assert "2.00" in csv_content
    
    # Verify amounts
    assert "1,000.00" in csv_content
    assert "900.00" in csv_content
    assert "300.00" in csv_content


def test_csv_export_tax_summary_rows():
    """Test tax summary rows are present."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-007",
        line_items=[
            LineItem(
                description="Taxable Item",
                quantity=1.0,
                rate=1000.00,
                amount=1000.00,
                tax_rate=18.0
            )
        ],
        subtotal=1000.00,
        cgst=90.00,
        sgst=90.00,
        igst=None,
        total_tax=180.00,
        grand_total=1180.00,
        currency="INR",
        confidence_score=0.92
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Verify tax summary rows
    assert "Subtotal:" in csv_content
    assert "CGST:" in csv_content
    assert "SGST:" in csv_content
    assert "Total Tax:" in csv_content
    assert "Grand Total:" in csv_content
    
    # Verify tax values
    assert "₹1,000.00" in csv_content or "1,000.00" in csv_content
    assert "₹90.00" in csv_content or "90.00" in csv_content
    assert "₹180.00" in csv_content or "180.00" in csv_content
    assert "₹1,180.00" in csv_content or "1,180.00" in csv_content


def test_csv_export_igst_only_summary():
    """Test CSV export with IGST only tax summary."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-008",
        line_items=[
            LineItem(
                description="Inter-state Item",
                quantity=1.0,
                rate=1000.00,
                amount=1000.00,
                tax_rate=18.0
            )
        ],
        subtotal=1000.00,
        cgst=None,
        sgst=None,
        igst=180.00,
        total_tax=180.00,
        grand_total=1180.00,
        currency="INR",
        confidence_score=0.9
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Verify IGST is present, CGST/SGST are not
    assert "IGST:" in csv_content
    assert "₹180.00" in csv_content or "180.00" in csv_content
    
    # CGST and SGST should not appear in summary
    lines = csv_content.split('\n')
    summary_lines = [line for line in lines if 'CGST:' in line or 'SGST:' in line]
    assert len(summary_lines) == 0


def test_csv_filename_includes_invoice_number():
    """Test filename includes invoice number."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-TEST-123",
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
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    
    # Check Content-Disposition header
    content_disposition = response.headers["content-disposition"]
    assert "attachment" in content_disposition
    assert "INV-2024-TEST-123" in content_disposition
    assert ".csv" in content_disposition


def test_csv_filename_sanitizes_special_characters():
    """Test filename sanitizes special characters."""
    invoice_data = InvoiceData(
        invoice_number="INV/2024\\TEST:123*Special?",
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
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    
    # Check that special characters are removed from filename
    content_disposition = response.headers["content-disposition"]
    assert "attachment" in content_disposition
    # Special characters should be removed, only alphanumeric and -_ should remain
    assert "/" not in content_disposition
    assert "\\" not in content_disposition
    assert ":" not in content_disposition
    assert "*" not in content_disposition
    assert "?" not in content_disposition


def test_csv_export_empty_invoice_number():
    """Test CSV export with empty invoice number."""
    invoice_data = InvoiceData(
        invoice_number=None,
        line_items=[
            LineItem(
                description="Test Item",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            )
        ],
        grand_total=100.00,
        confidence_score=0.8
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    # Should use "unknown" as fallback
    assert "invoice_unknown.csv" in response.headers["content-disposition"]


def test_csv_export_includes_additional_info():
    """Test CSV export includes additional invoice information."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-009",
        invoice_date="2024-01-15",
        due_date="2024-01-30",
        vendor_name="Test Vendor",
        buyer_name="Test Buyer",
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
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Verify additional info is included
    assert "Invoice Number:" in csv_content
    assert "INV-2024-009" in csv_content
    assert "Invoice Date:" in csv_content
    assert "2024-01-15" in csv_content
    assert "Vendor:" in csv_content
    assert "Test Vendor" in csv_content
    assert "Buyer:" in csv_content
    assert "Test Buyer" in csv_content


def test_csv_export_handles_none_values():
    """Test CSV export handles None values gracefully."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-010",
        line_items=[
            LineItem(
                description="Item with missing fields",
                quantity=1.0,
                rate=100.00,
                amount=100.00
                # hsn_sac, unit, tax_rate are None
            )
        ],
        subtotal=100.00,
        cgst=None,
        sgst=None,
        igst=None,
        total_tax=None,
        grand_total=100.00,
        currency="INR",
        confidence_score=0.85
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Should not crash with None values
    assert "Item with missing fields" in csv_content


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
