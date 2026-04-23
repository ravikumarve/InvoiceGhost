from fastapi import APIRouter, HTTPException, Response, Request
from pydantic import BaseModel
from typing import Optional
import csv
import io
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.invoice import InvoiceData
import os


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Rate limit from environment
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))


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


def generate_csv_content(invoice_data: InvoiceData) -> str:
    """Generate CSV content from InvoiceData.
    
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
    
    # Write line items
    for item in invoice_data.line_items:
        writer.writerow([
            item.description or "",
            item.hsn_sac or "",
            format_number(item.quantity),
            item.unit or "",
            format_indian_currency(item.rate),
            format_indian_currency(item.amount),
            f"{item.tax_rate}%" if item.tax_rate is not None else ""
        ])
    
    # Write summary rows
    writer.writerow([])  # Empty row for separation
    writer.writerow(["", "", "", "", "Subtotal:", format_indian_currency(invoice_data.subtotal), ""])
    
    # Write tax rows
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
        writer.writerow(["Invoice Number:", invoice_data.invoice_number])
    if invoice_data.invoice_date:
        writer.writerow(["Invoice Date:", invoice_data.invoice_date])
    if invoice_data.vendor_name:
        writer.writerow(["Vendor:", invoice_data.vendor_name])
    if invoice_data.buyer_name:
        writer.writerow(["Buyer:", invoice_data.buyer_name])
    
    csv_content = output.getvalue()
    output.close()
    
    return csv_content


@router.post("/export/csv")
@limiter.limit(f"{RATE_LIMIT_PER_MINUTE}/minute")
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
        
        # Generate filename
        invoice_number = csv_request.invoice_data.invoice_number or "unknown"
        # Sanitize filename - remove special characters
        safe_invoice_number = "".join(c for c in invoice_number if c.isalnum() or c in ('-', '_')).strip()
        if not safe_invoice_number:
            safe_invoice_number = "unknown"
        filename = f"invoice_{safe_invoice_number}.csv"
        
        # Return CSV file as response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/csv; charset=utf-8"
            }
        )
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=500,
            detail={"error": "export_failed", "message": "Failed to generate CSV file"}
        )
