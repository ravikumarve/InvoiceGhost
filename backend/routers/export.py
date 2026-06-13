"""CSV export endpoint for invoice data.

This module handles the POST /api/export/csv endpoint which:
- Accepts InvoiceData JSON in request body
- Generates CSV with proper formatting
- Protects against CSV injection attacks
- Returns CSV file download with proper headers
"""

from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional
import csv
import io
from urllib.parse import quote
from models.invoice import InvoiceData


router = APIRouter()


class CSVExportRequest(BaseModel):
    """Request model for CSV export endpoint."""
    invoice_data: InvoiceData


def format_indian_currency(value: Optional[float]) -> str:
    """Format a float value as Indian currency string.
    
    Args:
        value: The float value to format
        
    Returns:
        Formatted currency string or empty string if value is None
    """
    if value is None:
        return ""
    return f"₹{value:,.2f}"


def format_number(value: Optional[float]) -> str:
    """Format a float value as Indian number format.
    
    Args:
        value: The float value to format
        
    Returns:
        Formatted number string or empty string if value is None
    """
    if value is None:
        return ""
    return f"{value:,.2f}"


def sanitize_csv_field(value: str) -> str:
    """
    Sanitize a CSV field to prevent CSV injection attacks.
    
    CSV injection occurs when a cell starts with =, +, -, @, or tab/carriage return.
    Excel, Google Sheets, and LibreOffice will interpret these as formulas.
    
    Mitigation: Prefix dangerous characters with a single quote,
    which forces spreadsheet software to treat the cell as text.
    """
    if not value:
        return value
    
    # Characters that trigger formula interpretation in spreadsheets
    dangerous_prefixes = ('=', '+', '-', '@', '\t', '\r', '\n')
    
    if value.startswith(dangerous_prefixes):
        # Prefix with single quote to force text interpretation
        value = "'" + value
    
    return value


def sanitize_filename(name: str) -> str:
    """
    Sanitize a filename to prevent path traversal and header injection.
    
    Removes all characters except alphanumeric, hyphens, and underscores.
    """
    safe = "".join(c for c in name if c.isalnum() or c in ('-', '_')).strip()
    return safe or "unknown"


def generate_csv_content(invoice_data: InvoiceData) -> str:
    """Generate CSV content from InvoiceData with injection protection.
    
    Args:
        invoice_data: The invoice data to convert to CSV
        
    Returns:
        CSV content as string
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header row
    writer.writerow([
        "Description",
        "HSN/SAC",
        "Qty",
        "Unit",
        "Rate",
        "Amount",
        "Tax Rate"
    ])
    
    # Write line items — sanitize each field against CSV injection
    for item in invoice_data.line_items:
        writer.writerow([
            sanitize_csv_field(item.description or ""),
            sanitize_csv_field(item.hsn_sac or ""),
            format_number(item.quantity),
            sanitize_csv_field(item.unit or ""),
            format_indian_currency(item.rate),
            format_indian_currency(item.amount),
            f"{item.tax_rate}%" if item.tax_rate is not None else ""
        ])
    
    # Write summary rows
    writer.writerow([])  # Empty row for separation
    writer.writerow(["", "", "", "", "Subtotal:", format_indian_currency(invoice_data.subtotal), ""])
    
    # Write tax rows (only if they exist and are > 0)
    if invoice_data.cgst is not None and invoice_data.cgst > 0:
        writer.writerow(["", "", "", "", "CGST:", format_indian_currency(invoice_data.cgst), ""])
    if invoice_data.sgst is not None and invoice_data.sgst > 0:
        writer.writerow(["", "", "", "", "SGST:", format_indian_currency(invoice_data.sgst), ""])
    if invoice_data.igst is not None and invoice_data.igst > 0:
        writer.writerow(["", "", "", "", "IGST:", format_indian_currency(invoice_data.igst), ""])
    if invoice_data.total_tax is not None and invoice_data.total_tax > 0:
        writer.writerow(["", "", "", "", "Total Tax:", format_indian_currency(invoice_data.total_tax), ""])
    
    # Write grand total
    writer.writerow(["", "", "", "", "Grand Total:", format_indian_currency(invoice_data.grand_total), ""])
    
    # Write additional info
    if invoice_data.invoice_number:
        writer.writerow([])
        writer.writerow(["Invoice Number:", sanitize_csv_field(invoice_data.invoice_number)])
    if invoice_data.invoice_date:
        writer.writerow(["Invoice Date:", sanitize_csv_field(invoice_data.invoice_date)])
    if invoice_data.vendor_name:
        writer.writerow(["Vendor:", sanitize_csv_field(invoice_data.vendor_name)])
    if invoice_data.buyer_name:
        writer.writerow(["Buyer:", sanitize_csv_field(invoice_data.buyer_name)])
    
    csv_content = output.getvalue()
    output.close()
    
    return csv_content


@router.post("/export/csv")
async def export_csv(request: Request, csv_request: CSVExportRequest) -> Response:
    """Export invoice data as CSV file.
    
    This endpoint accepts InvoiceData JSON and returns a CSV file download
    with properly formatted Indian currency and number formatting.
    
    Args:
        request: CSVExportRequest containing the invoice data
        
    Returns:
        Response with CSV file attachment
        
    Raises:
        HTTPException: If invoice data is invalid or missing required fields
    """
    try:
        # Validate invoice data
        if not csv_request.invoice_data:
            raise HTTPException(
                status_code=400,
                detail={"error": "invalid_data", "message": "Invoice data is required"}
            )
        
        if not csv_request.invoice_data.line_items:
            raise HTTPException(
                status_code=400,
                detail={"error": "invalid_data", "message": "Invoice must contain at least one line item"}
            )
        
        # Generate CSV content
        csv_content = generate_csv_content(csv_request.invoice_data)
        
        # Generate sanitized filename
        invoice_number = csv_request.invoice_data.invoice_number or "unknown"
        safe_filename = sanitize_filename(invoice_number)
        filename = f"invoice_{safe_filename}.csv"
        
        # RFC 5987 encoded filename for proper handling of special chars
        encoded_filename = quote(filename)
        
        # Return CSV file as response with proper Content-Disposition
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                # Both filename and filename* for maximum browser compatibility
                "Content-Disposition": f"attachment; filename=\"{filename}\"; filename*=UTF-8''{encoded_filename}",
                "Content-Type": "text/csv; charset=utf-8",
                # Prevent browsers from sniffing content type
                "X-Content-Type-Options": "nosniff",
            }
        )
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={"error": "export_failed", "message": "Failed to generate CSV file"}
        )
