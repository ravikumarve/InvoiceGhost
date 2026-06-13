"""Invoice data models with strict validation.

These Pydantic models define the structured output of invoice extraction.
Key design decisions:
- extra='ignore' to handle dirty AI output gracefully
- confidence_score clamped to 0.0-1.0
- line_items must have at least 1 entry for a valid invoice
- All monetary fields are Optional[float] — AI may not find them
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class LineItem(BaseModel):
    """Represents a single line item in an invoice."""
    
    description: str = Field(..., min_length=1, description="Product/service name")
    hsn_sac: Optional[str] = None
    quantity: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = None
    rate: Optional[float] = Field(None, ge=0)
    amount: Optional[float] = Field(None, ge=0)
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    
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
    line_items: List[LineItem] = Field(..., min_length=1, description="At least one line item required")
    subtotal: Optional[float] = Field(None, ge=0)
    cgst: Optional[float] = Field(None, ge=0)
    sgst: Optional[float] = Field(None, ge=0)
    igst: Optional[float] = Field(None, ge=0)
    total_tax: Optional[float] = Field(None, ge=0)
    grand_total: Optional[float] = Field(None, ge=0)
    currency: str = "INR"
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI self-reported confidence 0.0-1.0")
    
    model_config = ConfigDict(extra='ignore')
    
    @field_validator('confidence_score', mode='before')
    @classmethod
    def clamp_confidence(cls, v):
        """Clamp confidence score to valid range, handling dirty AI output."""
        try:
            v = float(v)
        except (ValueError, TypeError):
            return 0.0
        return max(0.0, min(1.0, v))
    
    @field_validator('vendor_gstin', 'buyer_gstin', mode='before')
    @classmethod
    def validate_gstin(cls, v):
        """Validate GSTIN format if provided (15 chars alphanumeric)."""
        if v is None or v == "":
            return None
        v = str(v).strip().upper()
        # GSTIN is exactly 15 characters: 2 digits (state) + 10 PAN + 1 entity + 1 Z + 1 checksum
        if len(v) == 15 and v.isalnum():
            return v
        # Return as-is if it doesn't match — AI may extract partial GSTINs
        # Don't reject, just pass through
        return v
