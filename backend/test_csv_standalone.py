#!/usr/bin/env python3
"""
Standalone test for CSV export functionality.
This tests the CSV generation logic without requiring full FastAPI setup.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.invoice import InvoiceData, LineItem
from routers.export import generate_csv_content, format_indian_currency, format_number


def test_format_indian_currency():
    """Test Indian currency formatting."""
    print("Testing format_indian_currency...")
    
    # Test normal values
    assert format_indian_currency(100.00) == "₹100.00"
    assert format_indian_currency(1000.00) == "₹1,000.00"
    assert format_indian_currency(100000.00) == "₹100,000.00"
    
    # Test None values
    assert format_indian_currency(None) == ""
    
    print("✓ format_indian_currency tests passed")


def test_format_number():
    """Test number formatting."""
    print("Testing format_number...")
    
    # Test normal values
    assert format_number(100.00) == "100.00"
    assert format_number(1000.00) == "1,000.00"
    assert format_number(100000.00) == "100,000.00"
    
    # Test None values
    assert format_number(None) == ""
    
    print("✓ format_number tests passed")


def test_generate_csv_content():
    """Test CSV content generation."""
    print("Testing generate_csv_content...")
    
    # Create sample invoice data
    invoice_data = InvoiceData(
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
    
    # Generate CSV
    csv_content = generate_csv_content(invoice_data)
    
    # Verify CSV structure
    lines = csv_content.split('\n')
    
    # Check header
    assert "Description" in lines[0]
    assert "HSN/SAC" in lines[0]
    assert "Qty" in lines[0]
    assert "Unit" in lines[0]
    assert "Rate" in lines[0]
    assert "Amount" in lines[0]
    assert "Tax Rate" in lines[0]
    
    # Check line items
    assert any("Office Supplies" in line for line in lines)
    assert any("Computer Accessories" in line for line in lines)
    assert any("998311" in line for line in lines)
    assert any("847330" in line for line in lines)
    
    # Check summary rows
    assert any("Subtotal:" in line for line in lines)
    assert any("CGST:" in line for line in lines)
    assert any("SGST:" in line for line in lines)
    assert any("Grand Total:" in line for line in lines)
    
    # Check additional info
    assert any("Invoice Number:" in line for line in lines)
    assert any("INV-2024-001" in line for line in lines)
    assert any("Invoice Date:" in line for line in lines)
    assert any("2024-01-15" in line for line in lines)
    assert any("Vendor:" in line for line in lines)
    assert any("ABC Supplies Pvt Ltd" in line for line in lines)
    assert any("Buyer:" in line for line in lines)
    assert any("XYZ Enterprises" in line for line in lines)
    
    print("✓ generate_csv_content tests passed")
    print(f"Generated CSV has {len(lines)} lines")


def test_generate_csv_igst_only():
    """Test CSV generation with IGST only."""
    print("Testing generate_csv_content with IGST only...")
    
    invoice_data = InvoiceData(
        invoice_number="INV-2024-003",
        line_items=[
            LineItem(
                description="Inter-state Supply",
                quantity=1.0,
                rate=1000.00,
                amount=1000.00
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
    
    csv_content = generate_csv_content(invoice_data)
    lines = csv_content.split('\n')
    
    # Check that IGST is present but CGST/SGST are not
    assert any("IGST:" in line for line in lines)
    assert not any("CGST:" in line for line in lines)
    assert not any("SGST:" in line for line in lines)
    
    print("✓ IGST-only CSV generation tests passed")


def test_generate_csv_minimal():
    """Test CSV generation with minimal data."""
    print("Testing generate_csv_content with minimal data...")
    
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
    
    csv_content = generate_csv_content(invoice_data)
    lines = csv_content.split('\n')
    
    # Check basic structure
    assert "Description" in lines[0]
    assert any("Test Item" in line for line in lines)
    assert any("Grand Total:" in line for line in lines)
    
    print("✓ Minimal CSV generation tests passed")


def test_special_characters():
    """Test CSV generation with special characters."""
    print("Testing CSV generation with special characters...")
    
    invoice_data = InvoiceData(
        invoice_number='INV-2024-"TEST"',
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
    
    csv_content = generate_csv_content(invoice_data)
    
    # Check that special characters are handled
    assert "quotes" in csv_content
    assert "commas" in csv_content
    
    print("✓ Special character handling tests passed")


if __name__ == "__main__":
    print("=" * 60)
    print("Running CSV Export Functionality Tests")
    print("=" * 60)
    print()
    
    try:
        test_format_indian_currency()
        test_format_number()
        test_generate_csv_content()
        test_generate_csv_igst_only()
        test_generate_csv_minimal()
        test_special_characters()
        
        print()
        print("=" * 60)
        print("✓ All tests passed successfully!")
        print("=" * 60)
        
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"✗ Test failed: {e}")
        print("=" * 60)
        sys.exit(1)
    except Exception as e:
        print()
        print("=" * 60)
        print(f"✗ Unexpected error: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)
