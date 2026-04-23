#!/usr/bin/env python3
"""
Demo script to show CSV export functionality.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.invoice import InvoiceData, LineItem
from routers.export import generate_csv_content


def main():
    """Generate and display a sample CSV export."""
    
    # Create sample invoice data
    invoice_data = InvoiceData(
        invoice_number="INV-2024-001",
        invoice_date="2024-01-15",
        due_date="2024-02-14",
        vendor_name="ABC Supplies Pvt Ltd",
        vendor_gstin="29ABCDE1234F1Z5",
        vendor_address="123 Business Park, Bangalore, Karnataka - 560001",
        buyer_name="XYZ Enterprises",
        buyer_gstin="27FGHIJ5678K2L6",
        buyer_address="456 Tech Hub, Mumbai, Maharashtra - 400001",
        line_items=[
            LineItem(
                description="Office Supplies - Stationery Items",
                hsn_sac="998311",
                quantity=10.0,
                unit="pcs",
                rate=150.00,
                amount=1500.00,
                tax_rate=18.0
            ),
            LineItem(
                description="Computer Accessories - Mouse and Keyboard",
                hsn_sac="847330",
                quantity=5.0,
                unit="pcs",
                rate=500.00,
                amount=2500.00,
                tax_rate=18.0
            ),
            LineItem(
                description="Network Equipment - Router",
                hsn_sac="851762",
                quantity=2.0,
                unit="pcs",
                rate=2500.00,
                amount=5000.00,
                tax_rate=18.0
            )
        ],
        subtotal=9000.00,
        cgst=810.00,
        sgst=810.00,
        igst=None,
        total_tax=1620.00,
        grand_total=10620.00,
        currency="INR",
        payment_terms="Net 30 days",
        notes="Thank you for your business!",
        confidence_score=0.95
    )
    
    # Generate CSV
    csv_content = generate_csv_content(invoice_data)
    
    # Display the CSV
    print("=" * 80)
    print("CSV EXPORT DEMO - InvoiceGhost")
    print("=" * 80)
    print()
    print("Invoice Number:", invoice_data.invoice_number)
    print("Invoice Date:", invoice_data.invoice_date)
    print("Vendor:", invoice_data.vendor_name)
    print("Buyer:", invoice_data.buyer_name)
    print("Line Items:", len(invoice_data.line_items))
    print("Grand Total:", f"₹{invoice_data.grand_total:,.2f}")
    print()
    print("-" * 80)
    print("GENERATED CSV CONTENT:")
    print("-" * 80)
    print()
    print(csv_content)
    print("-" * 80)
    print()
    print("✓ CSV generated successfully!")
    print(f"✓ Total lines: {len(csv_content.split(chr(10)))}")
    print()


if __name__ == "__main__":
    main()
