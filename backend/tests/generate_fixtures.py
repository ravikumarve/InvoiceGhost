"""Generate test fixtures for InvoiceGhost testing.

This script creates:
1. gst_invoice_standard.pdf - Standard Indian GST invoice
2. freelance_receipt.jpg - Handwritten-style freelance receipt
3. foreign_invoice.pdf - USD invoice, no GSTIN
4. low_quality_scan.png - Blurry photo for low confidence testing
"""

import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from PIL import Image, ImageDraw, ImageFont
import io


def create_gst_invoice_pdf(output_path: Path):
    """Create a standard Indian GST invoice PDF."""
    doc = SimpleDocTemplate(str(output_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title = Paragraph("TAX INVOICE", styles["Title"])
    story.append(title)
    story.append(Spacer(1, 0.2*inch))
    
    # Invoice details
    invoice_data = [
        ["Invoice Number:", "INV-2024-001"],
        ["Invoice Date:", "15-01-2024"],
        ["Due Date:", "30-01-2024"],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(invoice_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Vendor details
    vendor_data = [
        ["Billed By:", ""],
        ["ABC Supplies Pvt Ltd", ""],
        ["GSTIN: 29ABCDE1234F1Z5", ""],
        ["123, Business Street", ""],
        ["Bangalore - 560001", ""],
    ]
    
    vendor_table = Table(vendor_data, colWidths=[2*inch, 3*inch])
    vendor_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(vendor_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Buyer details
    buyer_data = [
        ["Billed To:", ""],
        ["XYZ Enterprises", ""],
        ["GSTIN: 27FGHIJ5678K2L6", ""],
        ["456, Customer Road", ""],
        ["Mumbai - 400001", ""],
    ]
    
    buyer_table = Table(buyer_data, colWidths=[2*inch, 3*inch])
    buyer_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(buyer_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Line items
    items_data = [
        ["Description", "HSN/SAC", "Qty", "Unit", "Rate", "Amount", "Tax %"],
        ["Office Supplies", "998311", "10", "pcs", "150.00", "1,500.00", "18%"],
        ["Computer Accessories", "847330", "5", "pcs", "500.00", "2,500.00", "18%"],
    ]
    
    items_table = Table(items_data, colWidths=[2*inch, 0.8*inch, 0.5*inch, 0.5*inch, 0.8*inch, 1*inch, 0.6*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Summary
    summary_data = [
        ["Subtotal:", "₹4,000.00"],
        ["CGST (9%):", "₹360.00"],
        ["SGST (9%):", "₹360.00"],
        ["Grand Total:", "₹4,720.00"],
    ]
    
    summary_table = Table(summary_data, colWidths=[4*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LINEBELOW', (0, 0), (-1, -1), 2, colors.black),
    ]))
    story.append(summary_table)
    
    doc.build(story)
    print(f"Created GST invoice PDF: {output_path}")


def create_freelance_receipt_jpg(output_path: Path):
    """Create a handwritten-style freelance receipt image."""
    # Create a white background image
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font that looks somewhat handwritten
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw border
    draw.rectangle([10, 10, 790, 590], outline='black', width=3)
    
    # Title
    draw.text((300, 30), "RECEIPT", fill='black', font=font_large)
    
    # Receipt details
    y_pos = 80
    details = [
        "Date: 20-01-2024",
        "Receipt #: REC-2024-045",
        "",
        "Received from:",
        "John Smith",
        "for: Web Development Services",
        "",
        "Amount: $500.00",
        "",
        "Payment Method: Bank Transfer",
        "",
        "Thank you for your business!",
        "",
        "Signature: _________________",
    ]
    
    for line in details:
        draw.text((50, y_pos), line, fill='black', font=font_medium)
        y_pos += 35
    
    # Save as JPEG
    img.save(output_path, 'JPEG', quality=95)
    print(f"Created freelance receipt JPG: {output_path}")


def create_foreign_invoice_pdf(output_path: Path):
    """Create a USD invoice without GSTIN."""
    doc = SimpleDocTemplate(str(output_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title = Paragraph("INVOICE", styles["Title"])
    story.append(title)
    story.append(Spacer(1, 0.2*inch))
    
    # Invoice details
    invoice_data = [
        ["Invoice Number:", "INV-US-2024-001"],
        ["Invoice Date:", "2024-01-15"],
        ["Due Date:", "2024-02-15"],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch, 3*inch])
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(invoice_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Vendor details
    vendor_data = [
        ["From:", ""],
        ["Tech Solutions Inc", ""],
        ["123 Silicon Valley Blvd", ""],
        ["San Francisco, CA 94105", ""],
        ["USA", ""],
    ]
    
    vendor_table = Table(vendor_data, colWidths=[2*inch, 3*inch])
    vendor_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(vendor_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Buyer details
    buyer_data = [
        ["Bill To:", ""],
        ["Global Corp Ltd", ""],
        ["456 International Ave", ""],
        ["London, UK", ""],
    ]
    
    buyer_table = Table(buyer_data, colWidths=[2*inch, 3*inch])
    buyer_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
    ]))
    story.append(buyer_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Line items
    items_data = [
        ["Description", "Qty", "Unit Price", "Amount"],
        ["Software License", "1", "$1,000.00", "$1,000.00"],
        ["Support Services", "10", "$50.00", "$500.00"],
        ["Training", "5", "$100.00", "$500.00"],
    ]
    
    items_table = Table(items_data, colWidths=[2.5*inch, 0.5*inch, 1.2*inch, 1.2*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Summary
    summary_data = [
        ["Subtotal:", "$2,000.00"],
        ["Tax (8%):", "$160.00"],
        ["Total:", "$2,160.00"],
    ]
    
    summary_table = Table(summary_data, colWidths=[4*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LINEBELOW', (0, 0), (-1, -1), 2, colors.black),
    ]))
    story.append(summary_table)
    
    doc.build(story)
    print(f"Created foreign invoice PDF: {output_path}")


def create_low_quality_scan_png(output_path: Path):
    """Create a blurry, low-quality scan image."""
    # Create a basic invoice-like image
    img = Image.new('RGB', (600, 800), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
    
    # Draw some blurry text
    y_pos = 50
    details = [
        "INVOICE",
        "INV-2024-999",
        "Date: 2024-01-20",
        "",
        "Item:模糊的服务",
        "Qty: 5",
        "Price: $100",
        "Total: $500",
    ]
    
    for line in details:
        draw.text((50, y_pos), line, fill='gray', font=font_large)
        y_pos += 60
    
    # Apply blur effect to simulate low quality scan
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    
    # Add some noise
    import random
    pixels = img.load()
    for i in range(img.width):
        for j in range(img.height):
            if random.random() < 0.1:
                r, g, b = pixels[i, j]
                noise = random.randint(-30, 30)
                pixels[i, j] = (
                    max(0, min(255, r + noise)),
                    max(0, min(255, g + noise)),
                    max(0, min(255, b + noise))
                )
    
    # Save as PNG
    img.save(output_path, 'PNG')
    print(f"Created low quality scan PNG: {output_path}")


if __name__ == "__main__":
    from PIL import ImageFilter
    
    fixtures_dir = Path(__file__).parent / "fixtures"
    fixtures_dir.mkdir(exist_ok=True)
    
    print("Generating test fixtures...")
    
    create_gst_invoice_pdf(fixtures_dir / "gst_invoice_standard.pdf")
    create_freelance_receipt_jpg(fixtures_dir / "freelance_receipt.jpg")
    create_foreign_invoice_pdf(fixtures_dir / "foreign_invoice.pdf")
    create_low_quality_scan_png(fixtures_dir / "low_quality_scan.png")
    
    print(f"\nAll fixtures created in: {fixtures_dir}")
