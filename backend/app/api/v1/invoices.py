"""Invoice management API endpoints."""
from typing import List, Optional
from uuid import UUID
import random
import string
from datetime import datetime, date
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from app.api.deps import DBSession, CurrentUser
from app.models.invoice import Invoice, InvoiceStatus, InvoiceLineItem, Payment, PaymentMethod
from app.models.client import Client
from app.models.matter import Matter
from app.models.time_entry import TimeEntry, TimeEntryStatus
from app.models.user import User
from app.schemas.invoice import (
    InvoiceCreate,
    InvoiceCreateFromTimeEntries,
    InvoiceUpdate,
    InvoiceResponse,
    InvoiceDetail,
    InvoiceBrief,
    InvoiceSummary,
    InvoiceLineItemCreate,
    InvoiceLineItemResponse,
    PaymentCreate,
    PaymentResponse
)

router = APIRouter(prefix="/invoices", tags=["Invoices"])


def generate_invoice_number() -> str:
    """Generate a unique invoice number."""
    timestamp = datetime.now().strftime("%Y%m")
    random_part = ''.join(random.choices(string.digits, k=5))
    return f"INV-{timestamp}-{random_part}"


def calculate_invoice_totals(invoice: Invoice) -> None:
    """Calculate and update invoice totals."""
    subtotal = sum(item.amount for item in invoice.line_items)
    tax_amount = int(subtotal * invoice.tax_rate / 10000)  # tax_rate in basis points
    total_amount = subtotal + tax_amount - invoice.discount_amount
    amount_paid = sum(payment.amount for payment in invoice.payments)
    
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total_amount = total_amount
    invoice.amount_paid = amount_paid
    
    # Update status based on payment
    if amount_paid >= total_amount and total_amount > 0:
        invoice.status = InvoiceStatus.PAID
        invoice.paid_date = date.today()
    elif amount_paid > 0:
        invoice.status = InvoiceStatus.PARTIALLY_PAID


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceResponse:
    """Create a new invoice with line items."""
    
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == invoice_data.client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Verify matter if provided
    if invoice_data.matter_id:
        result = await db.execute(select(Matter).where(Matter.id == invoice_data.matter_id))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matter not found")
    
    # Generate unique invoice number
    invoice_number = generate_invoice_number()
    while True:
        result = await db.execute(select(Invoice).where(Invoice.invoice_number == invoice_number))
        if not result.scalar_one_or_none():
            break
        invoice_number = generate_invoice_number()
    
    # Create invoice
    invoice = Invoice(
        invoice_number=invoice_number,
        client_id=invoice_data.client_id,
        matter_id=invoice_data.matter_id,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        tax_rate=invoice_data.tax_rate,
        discount_amount=invoice_data.discount_amount,
        billing_period_start=invoice_data.billing_period_start,
        billing_period_end=invoice_data.billing_period_end,
        notes=invoice_data.notes,
        payment_terms=invoice_data.payment_terms,
        currency=invoice_data.currency,
        status=InvoiceStatus.DRAFT
    )
    
    db.add(invoice)
    await db.flush()
    
    # Add line items
    for idx, item_data in enumerate(invoice_data.line_items):
        line_item = InvoiceLineItem(
            invoice_id=invoice.id,
            time_entry_id=item_data.time_entry_id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            amount=int(item_data.quantity * item_data.unit_price / 100),
            entry_date=item_data.entry_date,
            timekeeper_name=item_data.timekeeper_name,
            sort_order=idx
        )
        db.add(line_item)
    
    await db.flush()
    await db.refresh(invoice, ["line_items", "payments"])
    
    calculate_invoice_totals(invoice)
    await db.flush()
    await db.refresh(invoice)
    
    return _build_invoice_response(invoice)


@router.post("/from-time-entries", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice_from_time_entries(
    invoice_data: InvoiceCreateFromTimeEntries,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceResponse:
    """Create an invoice from selected time entries."""
    
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == invoice_data.client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    
    # Get time entries with user info
    query = (
        select(TimeEntry)
        .options(selectinload(TimeEntry.user))
        .where(
            TimeEntry.id.in_(invoice_data.time_entry_ids),
            TimeEntry.is_billable == True,
            TimeEntry.is_billed == False
        )
    )
    result = await db.execute(query)
    time_entries = result.scalars().all()
    
    if not time_entries:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No billable, unbilled time entries found"
        )
    
    # Generate invoice number
    invoice_number = generate_invoice_number()
    while True:
        result = await db.execute(select(Invoice).where(Invoice.invoice_number == invoice_number))
        if not result.scalar_one_or_none():
            break
        invoice_number = generate_invoice_number()
    
    # Create invoice
    invoice = Invoice(
        invoice_number=invoice_number,
        client_id=invoice_data.client_id,
        matter_id=invoice_data.matter_id,
        issue_date=invoice_data.issue_date,
        due_date=invoice_data.due_date,
        tax_rate=invoice_data.tax_rate,
        notes=invoice_data.notes,
        payment_terms=invoice_data.payment_terms,
        currency=invoice_data.currency,
        status=InvoiceStatus.DRAFT
    )
    
    db.add(invoice)
    await db.flush()
    
    # Create line items from time entries
    for idx, entry in enumerate(time_entries):
        hours = entry.duration_minutes / 60.0
        amount = entry.total_amount
        
        line_item = InvoiceLineItem(
            invoice_id=invoice.id,
            time_entry_id=entry.id,
            description=entry.description,
            quantity=int(hours * 100),  # Hours in hundredths
            unit_price=entry.hourly_rate,
            amount=amount,
            entry_date=entry.entry_date,
            timekeeper_name=entry.user.full_name if entry.user else None,
            sort_order=idx
        )
        db.add(line_item)
        
        # Mark time entry as billed
        entry.is_billed = True
        entry.status = TimeEntryStatus.BILLED
        entry.invoice_id = invoice.id
    
    await db.flush()
    await db.refresh(invoice, ["line_items", "payments"])
    
    calculate_invoice_totals(invoice)
    await db.flush()
    await db.refresh(invoice)
    
    return _build_invoice_response(invoice)


@router.get("", response_model=List[InvoiceBrief])
async def list_invoices(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    client_id: Optional[UUID] = None,
    matter_id: Optional[UUID] = None,
    status: Optional[InvoiceStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None
) -> List[InvoiceBrief]:
    """List invoices with optional filtering."""
    
    query = select(Invoice)
    
    if client_id:
        query = query.where(Invoice.client_id == client_id)
    if matter_id:
        query = query.where(Invoice.matter_id == matter_id)
    if status:
        query = query.where(Invoice.status == status)
    if date_from:
        query = query.where(Invoice.issue_date >= date_from)
    if date_to:
        query = query.where(Invoice.issue_date <= date_to)
    
    query = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return [
        InvoiceBrief(
            id=inv.id,
            invoice_number=inv.invoice_number,
            status=inv.status,
            issue_date=inv.issue_date,
            due_date=inv.due_date,
            total_amount=inv.total_amount,
            balance_due=inv.balance_due
        )
        for inv in invoices
    ]


@router.get("/summary", response_model=InvoiceSummary)
async def get_invoice_summary(
    db: DBSession,
    current_user: CurrentUser,
    client_id: Optional[UUID] = None
) -> InvoiceSummary:
    """Get invoice summary statistics."""
    
    query = select(Invoice)
    if client_id:
        query = query.where(Invoice.client_id == client_id)
    
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    total_invoices = len(invoices)
    total_amount = sum(inv.total_amount for inv in invoices)
    total_paid = sum(inv.amount_paid for inv in invoices)
    total_outstanding = total_amount - total_paid
    
    overdue = [inv for inv in invoices if inv.due_date < date.today() and inv.balance_due > 0]
    overdue_count = len(overdue)
    overdue_amount = sum(inv.balance_due for inv in overdue)
    
    return InvoiceSummary(
        total_invoices=total_invoices,
        total_amount=total_amount,
        total_paid=total_paid,
        total_outstanding=total_outstanding,
        overdue_count=overdue_count,
        overdue_amount=overdue_amount
    )


@router.get("/{invoice_id}", response_model=InvoiceDetail)
async def get_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceDetail:
    """Get invoice with full details including line items and payments."""
    
    query = (
        select(Invoice)
        .options(
            selectinload(Invoice.line_items),
            selectinload(Invoice.payments)
        )
        .where(Invoice.id == invoice_id)
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    return _build_invoice_detail(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    invoice_data: InvoiceUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceResponse:
    """Update an invoice."""
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    if invoice.status in [InvoiceStatus.PAID, InvoiceStatus.VOID]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a paid or voided invoice"
        )
    
    update_data = invoice_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(invoice, field, value)
    
    await db.flush()
    await db.refresh(invoice)
    
    return _build_invoice_response(invoice)


@router.post("/{invoice_id}/send", response_model=InvoiceResponse)
async def send_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceResponse:
    """Mark invoice as sent."""
    
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    if invoice.status != InvoiceStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft invoices can be sent"
        )
    
    invoice.status = InvoiceStatus.SENT
    await db.flush()
    await db.refresh(invoice)
    
    return _build_invoice_response(invoice)


@router.post("/{invoice_id}/void", response_model=InvoiceResponse)
async def void_invoice(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> InvoiceResponse:
    """Void an invoice."""
    
    query = (
        select(Invoice)
        .options(selectinload(Invoice.line_items))
        .where(Invoice.id == invoice_id)
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    if invoice.status == InvoiceStatus.PAID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot void a paid invoice"
        )
    
    # Unmark time entries as billed
    for line_item in invoice.line_items:
        if line_item.time_entry_id:
            result = await db.execute(
                select(TimeEntry).where(TimeEntry.id == line_item.time_entry_id)
            )
            time_entry = result.scalar_one_or_none()
            if time_entry:
                time_entry.is_billed = False
                time_entry.status = TimeEntryStatus.APPROVED
                time_entry.invoice_id = None
    
    invoice.status = InvoiceStatus.VOID
    await db.flush()
    await db.refresh(invoice)
    
    return _build_invoice_response(invoice)


@router.post("/{invoice_id}/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def add_payment(
    invoice_id: UUID,
    payment_data: PaymentCreate,
    db: DBSession,
    current_user: CurrentUser
) -> PaymentResponse:
    """Add a payment to an invoice."""
    
    query = (
        select(Invoice)
        .options(selectinload(Invoice.payments))
        .where(Invoice.id == invoice_id)
    )
    result = await db.execute(query)
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    if invoice.status in [InvoiceStatus.PAID, InvoiceStatus.VOID]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add payment to a paid or voided invoice"
        )
    
    payment = Payment(
        invoice_id=invoice_id,
        amount=payment_data.amount,
        payment_date=payment_data.payment_date,
        payment_method=payment_data.payment_method,
        reference_number=payment_data.reference_number,
        notes=payment_data.notes
    )
    
    db.add(payment)
    await db.flush()
    
    # Recalculate invoice totals
    await db.refresh(invoice, ["payments"])
    calculate_invoice_totals(invoice)
    await db.flush()
    await db.refresh(payment)
    
    return PaymentResponse.model_validate(payment)


@router.get("/{invoice_id}/payments", response_model=List[PaymentResponse])
async def list_invoice_payments(
    invoice_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> List[PaymentResponse]:
    """List all payments for an invoice."""
    
    # Verify invoice exists
    result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    query = select(Payment).where(Payment.invoice_id == invoice_id).order_by(Payment.payment_date)
    result = await db.execute(query)
    payments = result.scalars().all()
    
    return [PaymentResponse.model_validate(p) for p in payments]


def _build_invoice_response(invoice: Invoice) -> InvoiceResponse:
    """Build InvoiceResponse from Invoice model."""
    return InvoiceResponse(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        client_id=invoice.client_id,
        matter_id=invoice.matter_id,
        status=invoice.status,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        paid_date=invoice.paid_date,
        subtotal=invoice.subtotal,
        tax_rate=invoice.tax_rate,
        tax_amount=invoice.tax_amount,
        discount_amount=invoice.discount_amount,
        total_amount=invoice.total_amount,
        amount_paid=invoice.amount_paid,
        balance_due=invoice.balance_due,
        billing_period_start=invoice.billing_period_start,
        billing_period_end=invoice.billing_period_end,
        notes=invoice.notes,
        payment_terms=invoice.payment_terms,
        currency=invoice.currency,
        created_at=invoice.created_at,
        updated_at=invoice.updated_at
    )


def _build_invoice_detail(invoice: Invoice) -> InvoiceDetail:
    """Build InvoiceDetail with line items and payments."""
    response = _build_invoice_response(invoice)
    return InvoiceDetail(
        **response.model_dump(),
        line_items=[InvoiceLineItemResponse.model_validate(li) for li in invoice.line_items],
        payments=[PaymentResponse.model_validate(p) for p in invoice.payments]
    )
