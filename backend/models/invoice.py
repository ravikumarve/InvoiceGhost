from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class LineItem(BaseModel):
    """Represents a single line item in an invoice."""
    
    description: str
    hsn_sac: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    amount: Optional[float] = None
    tax_rate: Optional[float] = None
    
    model_config = ConfigDict(extra='ignore')


class InvoiceData(BaseModel):
    """Represents structured invoice data extracted from PDF or image."""
    
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_gstin: Optional[str] = None
    vendor_address: Optional[str] = None
    buyer_name: Optional[str] = None
    buyer_gstin: Optional[str] = None
    buyer_address: Optional[str] = None
    line_items: List[LineItem]
    subtotal: Optional[float] = None
    cgst: Optional[float] = None
    sgst: Optional[float] = None
    igst: Optional[float] = None
    total_tax: Optional[float] = None
    grand_total: Optional[float] = None
    currency: str = "INR"
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    confidence_score: float
    
    model_config = ConfigDict(extra='ignore')
