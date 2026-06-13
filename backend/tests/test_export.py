"""Test CSV export endpoint functionality.

This test module verifies:
1. Successful CSV export
2. CSV injection protection
3. Filename sanitization
4. Tax summary formatting
5. Edge cases (empty data, special characters)
"""

import pytest
from models.invoice import InvoiceData, LineItem


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


def test_export_csv_success(sample_invoice_data, client):
    """Test successful CSV export."""
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": sample_invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert "attachment" in response.headers["content-disposition"]
    assert "invoice_INV-2024-001.csv" in response.headers["content-disposition"]
    
    # Verify CSV content
    csv_content = response.text
    assert "Description" in csv_content
    assert "HSN/SAC" in csv_content
    assert "Office Supplies" in csv_content
    assert "Computer Accessories" in csv_content


def test_export_csv_minimal_data(minimal_invoice_data, client):
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


def test_export_csv_no_invoice_number(client):
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


def test_export_csv_special_characters(client):
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


def test_export_csv_no_line_items(client):
    """Test CSV export with no line items (should fail)."""
    # InvoiceData now requires min_length=1 for line_items
    # So this should fail at the Pydantic validation level
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
    
    # Should get 422 (Pydantic validation) since line_items min_length=1
    assert response.status_code in [400, 422]


def test_export_csv_missing_invoice_data(client):
    """Test CSV export with missing invoice data (should fail)."""
    response = client.post(
        "/api/export/csv",
        json={}
    )
    
    assert response.status_code == 422  # Validation error


def test_export_csv_igst_only(client):
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


def test_csv_export_has_correct_headers(client):
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


def test_csv_export_line_items_match_input(client):
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
    
    assert "First Item" in csv_content
    assert "Second Item" in csv_content
    assert "Third Item" in csv_content
    assert "998311" in csv_content
    assert "847330" in csv_content


def test_csv_export_tax_summary_rows(client):
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
    
    assert "Subtotal:" in csv_content
    assert "CGST:" in csv_content
    assert "SGST:" in csv_content
    assert "Total Tax:" in csv_content
    assert "Grand Total:" in csv_content


def test_csv_export_igst_only_summary(client):
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
    
    assert "IGST:" in csv_content
    # CGST and SGST should not appear in summary
    lines = csv_content.split('\n')
    summary_lines = [line for line in lines if 'CGST:' in line or 'SGST:' in line]
    assert len(summary_lines) == 0


def test_csv_filename_includes_invoice_number(client):
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
    content_disposition = response.headers["content-disposition"]
    assert "attachment" in content_disposition
    assert "INV-2024-TEST-123" in content_disposition
    assert ".csv" in content_disposition


def test_csv_filename_sanitizes_special_characters(client):
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
    content_disposition = response.headers["content-disposition"]
    assert "attachment" in content_disposition
    # Special characters should be removed from the filename parameter
    # Note: filename*= uses RFC 5987 encoding which contains * as syntax
    # Extract just the filename= portion for validation
    filename_part = content_disposition.split('filename="')[1].split('"')[0]
    assert "/" not in filename_part
    assert "\\" not in filename_part
    assert ":" not in filename_part
    assert "*" not in filename_part
    assert "?" not in filename_part


def test_csv_export_empty_invoice_number(client):
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
    assert "invoice_unknown.csv" in response.headers["content-disposition"]


def test_csv_export_includes_additional_info(client):
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
    
    assert "Invoice Number:" in csv_content
    assert "INV-2024-009" in csv_content
    assert "Invoice Date:" in csv_content
    assert "2024-01-15" in csv_content
    assert "Vendor:" in csv_content
    assert "Test Vendor" in csv_content
    assert "Buyer:" in csv_content
    assert "Test Buyer" in csv_content


def test_csv_export_handles_none_values(client):
    """Test CSV export handles None values gracefully."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-010",
        line_items=[
            LineItem(
                description="Item with missing fields",
                quantity=1.0,
                rate=100.00,
                amount=100.00
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
    assert "Item with missing fields" in csv_content


def test_csv_injection_protection(client):
    """Test that CSV injection attacks are neutralized."""
    invoice_data = InvoiceData(
        invoice_number="INV-2024-INJECT",
        line_items=[
            LineItem(
                description="=CMD|'/C calc'!A0",  # Classic CSV injection
                quantity=1.0,
                rate=100.00,
                amount=100.00
            ),
            LineItem(
                description="+CMD|'/C calc'!A0",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            ),
            LineItem(
                description="-CMD|'/C calc'!A0",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            ),
            LineItem(
                description="@SUM(1+1)*cmd|' /C calc'!A0",
                quantity=1.0,
                rate=100.00,
                amount=100.00
            )
        ],
        grand_total=400.00,
        confidence_score=0.8
    )
    
    response = client.post(
        "/api/export/csv",
        json={"invoice_data": invoice_data.model_dump()}
    )
    
    assert response.status_code == 200
    csv_content = response.text
    
    # Dangerous prefixes should be neutralized with single quote prefix
    # The raw = + - @ should not appear at the start of a CSV cell
    lines = csv_content.split('\n')
    data_lines = lines[1:]  # Skip header
    
    for line in data_lines:
        if line and not line.startswith(','):
            # First field in each data row should not start with dangerous char
            first_field_start = line[0] if line else ''
            assert first_field_start not in ('=', '+', '-', '@') or line.startswith("'"), \
                f"CSV injection risk: line starts with {first_field_start}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
