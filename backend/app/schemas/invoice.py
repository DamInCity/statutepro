"""Invoice schemas for API requests/responses."""
from typing import Optional, List
from uuid import UUID
from datetime import date
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.invoice import InvoiceStatus, PaymentMethod


class InvoiceLineItemBase(BaseSchema):
    """Base line item schema."""
    
    description: str = Field(..., min_length=1)
    quantity: int = Field(default=100, ge=1, description="Quantity in hundredths (100 = 1.00)")
    unit_price: int = Field(..., ge=0, description="Unit price in cents")
    entry_date: Optional[date] = None
    timekeeper_name: Optional[str] = Field(None, max_length=255)


class InvoiceLineItemCreate(InvoiceLineItemBase):
    """Schema for creating a line item."""
    
    time_entry_id: Optional[UUID] = None


class InvoiceLineItemResponse(InvoiceLineItemBase, TimestampSchema):
    """Schema for line item response."""
    
    id: UUID
    invoice_id: UUID
    time_entry_id: Optional[UUID]
    amount: int
    sort_order: int


class PaymentBase(BaseSchema):
    """Base payment schema."""
    
    amount: int = Field(..., gt=0, description="Amount in cents")
    payment_date: date
    payment_method: PaymentMethod
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    """Schema for creating a payment."""
    
    invoice_id: UUID


class PaymentResponse(PaymentBase, TimestampSchema):
    """Schema for payment response."""
    
    id: UUID
    invoice_id: UUID
    trust_transaction_id: Optional[UUID]


class InvoiceBase(BaseSchema):
    """Base invoice schema."""
    
    issue_date: date
    due_date: date
    tax_rate: int = Field(default=0, ge=0, description="Tax rate in basis points (1600 = 16%)")
    discount_amount: int = Field(default=0, ge=0, description="Discount in cents")
    billing_period_start: Optional[date] = None
    billing_period_end: Optional[date] = None
    notes: Optional[str] = None
    payment_terms: Optional[str] = None
    currency: str = Field(default="KES", max_length=3)


class InvoiceCreate(InvoiceBase):
    """Schema for creating an invoice."""
    
    client_id: UUID
    matter_id: Optional[UUID] = None
    line_items: List[InvoiceLineItemCreate] = []


class InvoiceCreateFromTimeEntries(BaseSchema):
    """Schema for creating an invoice from time entries."""
    
    client_id: UUID
    matter_id: Optional[UUID] = None
    time_entry_ids: List[UUID]
    issue_date: date
    due_date: date
    tax_rate: int = Field(default=0, ge=0)
    notes: Optional[str] = None
    payment_terms: Optional[str] = None
    currency: str = Field(default="KES", max_length=3)


class InvoiceUpdate(BaseSchema):
    """Schema for updating an invoice."""
    
    status: Optional[InvoiceStatus] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    tax_rate: Optional[int] = Field(None, ge=0)
    discount_amount: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    payment_terms: Optional[str] = None


class InvoiceResponse(InvoiceBase, TimestampSchema):
    """Schema for invoice response."""
    
    id: UUID
    invoice_number: str
    client_id: UUID
    matter_id: Optional[UUID]
    status: InvoiceStatus
    subtotal: int
    tax_amount: int
    total_amount: int
    amount_paid: int
    paid_date: Optional[date]
    
    # Computed
    balance_due: int


class InvoiceDetail(InvoiceResponse):
    """Detailed invoice response with line items and payments."""
    
    line_items: List[InvoiceLineItemResponse] = []
    payments: List[PaymentResponse] = []


class InvoiceBrief(BaseSchema):
    """Brief invoice info for lists."""
    
    id: UUID
    invoice_number: str
    status: InvoiceStatus
    issue_date: date
    due_date: date
    total_amount: int
    balance_due: int


class InvoiceSummary(BaseSchema):
    """Summary statistics for invoices."""
    
    total_invoices: int
    total_amount: int
    total_paid: int
    total_outstanding: int
    overdue_count: int
    overdue_amount: int
