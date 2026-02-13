"""Client Portal API - Read-only endpoints for clients."""
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, HTTPException, status, Query, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.db import get_db
from app.core.security import decode_token
from app.models.client import Client
from app.models.matter import Matter, MatterStatus
from app.models.document import Document
from app.models.invoice import Invoice, InvoiceStatus
from app.models.trust_account import ClientTrustLedger
from app.schemas.matter import MatterBrief
from app.schemas.document import DocumentBrief
from app.schemas.invoice import InvoiceBrief
from app.schemas.trust_account import ClientTrustBalance
from app.schemas.base import BaseSchema

router = APIRouter(prefix="/portal", tags=["Client Portal"])

# Client portal security - uses a different token type
portal_security = HTTPBearer()


class PortalClientInfo(BaseSchema):
    """Client info for portal."""
    id: UUID
    name: str
    client_number: str
    email: Optional[str]


class PortalMatterSummary(BaseSchema):
    """Matter summary for portal."""
    id: UUID
    matter_number: str
    name: str
    status: MatterStatus
    open_date: date
    close_date: Optional[date]


class PortalInvoiceSummary(BaseSchema):
    """Invoice summary for portal."""
    id: UUID
    invoice_number: str
    status: InvoiceStatus
    issue_date: date
    due_date: date
    total_amount: int
    balance_due: int


class PortalDocumentInfo(BaseSchema):
    """Document info for portal (limited fields)."""
    id: UUID
    name: str
    category: str
    created_at: str


class PortalDashboard(BaseSchema):
    """Client portal dashboard data."""
    client: PortalClientInfo
    active_matters_count: int
    open_invoices_count: int
    total_outstanding: int
    trust_balance: int
    recent_matters: List[PortalMatterSummary]
    recent_invoices: List[PortalInvoiceSummary]


async def get_portal_client(
    credentials: HTTPAuthorizationCredentials = Depends(portal_security),
    db: AsyncSession = Depends(get_db)
) -> Client:
    """Get authenticated portal client from token."""
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Portal tokens have type "portal"
    if payload.get("type") != "portal":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for portal access"
        )
    
    client_id = payload.get("sub")
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return client


@router.get("/dashboard", response_model=PortalDashboard)
async def get_portal_dashboard(
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db)
) -> PortalDashboard:
    """Get client portal dashboard with overview data."""
    
    # Get active matters
    result = await db.execute(
        select(Matter)
        .where(
            Matter.client_id == client.id,
            Matter.status.in_([MatterStatus.ACTIVE, MatterStatus.PENDING, MatterStatus.INTAKE])
        )
        .order_by(Matter.created_at.desc())
        .limit(5)
    )
    recent_matters = result.scalars().all()
    active_matters_count = len(recent_matters)
    
    # Get open invoices
    result = await db.execute(
        select(Invoice)
        .where(
            Invoice.client_id == client.id,
            Invoice.status.in_([InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE])
        )
        .order_by(Invoice.issue_date.desc())
        .limit(5)
    )
    recent_invoices = result.scalars().all()
    
    # Calculate totals
    result = await db.execute(
        select(Invoice).where(
            Invoice.client_id == client.id,
            Invoice.status.notin_([InvoiceStatus.DRAFT, InvoiceStatus.PAID, InvoiceStatus.VOID, InvoiceStatus.WRITTEN_OFF])
        )
    )
    all_open_invoices = result.scalars().all()
    open_invoices_count = len(all_open_invoices)
    total_outstanding = sum(inv.balance_due for inv in all_open_invoices)
    
    # Get trust balance
    result = await db.execute(
        select(ClientTrustLedger).where(ClientTrustLedger.client_id == client.id)
    )
    ledgers = result.scalars().all()
    trust_balance = sum(l.balance for l in ledgers)
    
    return PortalDashboard(
        client=PortalClientInfo(
            id=client.id,
            name=client.name,
            client_number=client.client_number,
            email=client.email
        ),
        active_matters_count=active_matters_count,
        open_invoices_count=open_invoices_count,
        total_outstanding=total_outstanding,
        trust_balance=trust_balance,
        recent_matters=[
            PortalMatterSummary(
                id=m.id,
                matter_number=m.matter_number,
                name=m.name,
                status=m.status,
                open_date=m.open_date,
                close_date=m.close_date
            )
            for m in recent_matters
        ],
        recent_invoices=[
            PortalInvoiceSummary(
                id=inv.id,
                invoice_number=inv.invoice_number,
                status=inv.status,
                issue_date=inv.issue_date,
                due_date=inv.due_date,
                total_amount=inv.total_amount,
                balance_due=inv.balance_due
            )
            for inv in recent_invoices
        ]
    )


@router.get("/matters", response_model=List[PortalMatterSummary])
async def list_client_matters(
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[MatterStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50)
) -> List[PortalMatterSummary]:
    """List client's matters."""
    
    query = select(Matter).where(Matter.client_id == client.id)
    
    if status_filter:
        query = query.where(Matter.status == status_filter)
    
    query = query.order_by(Matter.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    matters = result.scalars().all()
    
    return [
        PortalMatterSummary(
            id=m.id,
            matter_number=m.matter_number,
            name=m.name,
            status=m.status,
            open_date=m.open_date,
            close_date=m.close_date
        )
        for m in matters
    ]


@router.get("/matters/{matter_id}", response_model=PortalMatterSummary)
async def get_client_matter(
    matter_id: UUID,
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db)
) -> PortalMatterSummary:
    """Get a specific matter."""
    
    result = await db.execute(
        select(Matter).where(
            Matter.id == matter_id,
            Matter.client_id == client.id
        )
    )
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matter not found")
    
    return PortalMatterSummary(
        id=matter.id,
        matter_number=matter.matter_number,
        name=matter.name,
        status=matter.status,
        open_date=matter.open_date,
        close_date=matter.close_date
    )


@router.get("/matters/{matter_id}/documents", response_model=List[PortalDocumentInfo])
async def list_matter_documents(
    matter_id: UUID,
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db)
) -> List[PortalDocumentInfo]:
    """List documents for a matter (client-accessible only)."""
    
    # Verify matter belongs to client
    result = await db.execute(
        select(Matter).where(
            Matter.id == matter_id,
            Matter.client_id == client.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Matter not found")
    
    # Get client-accessible documents (e.g., correspondence, client documents)
    from app.models.document import DocumentCategory
    
    result = await db.execute(
        select(Document)
        .where(
            Document.matter_id == matter_id,
            Document.category.in_([
                DocumentCategory.CORRESPONDENCE,
                DocumentCategory.CLIENT_DOC,
                DocumentCategory.CONTRACT
            ])
        )
        .order_by(Document.created_at.desc())
    )
    documents = result.scalars().all()
    
    return [
        PortalDocumentInfo(
            id=doc.id,
            name=doc.name,
            category=doc.category.value,
            created_at=doc.created_at.isoformat()
        )
        for doc in documents
    ]


@router.get("/invoices", response_model=List[PortalInvoiceSummary])
async def list_client_invoices(
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[InvoiceStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50)
) -> List[PortalInvoiceSummary]:
    """List client's invoices."""
    
    query = select(Invoice).where(
        Invoice.client_id == client.id,
        Invoice.status != InvoiceStatus.DRAFT  # Don't show drafts to clients
    )
    
    if status_filter:
        query = query.where(Invoice.status == status_filter)
    
    query = query.order_by(Invoice.issue_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return [
        PortalInvoiceSummary(
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


@router.get("/invoices/{invoice_id}", response_model=PortalInvoiceSummary)
async def get_client_invoice(
    invoice_id: UUID,
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db)
) -> PortalInvoiceSummary:
    """Get a specific invoice."""
    
    result = await db.execute(
        select(Invoice).where(
            Invoice.id == invoice_id,
            Invoice.client_id == client.id,
            Invoice.status != InvoiceStatus.DRAFT
        )
    )
    invoice = result.scalar_one_or_none()
    
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    
    # Mark as viewed if sent
    if invoice.status == InvoiceStatus.SENT:
        invoice.status = InvoiceStatus.VIEWED
        await db.flush()
    
    return PortalInvoiceSummary(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        status=invoice.status,
        issue_date=invoice.issue_date,
        due_date=invoice.due_date,
        total_amount=invoice.total_amount,
        balance_due=invoice.balance_due
    )


@router.get("/trust-balance", response_model=ClientTrustBalance)
async def get_client_trust_balance(
    client: Client = Depends(get_portal_client),
    db: AsyncSession = Depends(get_db)
) -> ClientTrustBalance:
    """Get client's trust account balance."""
    
    result = await db.execute(
        select(ClientTrustLedger).where(ClientTrustLedger.client_id == client.id)
    )
    ledgers = result.scalars().all()
    
    total_balance = sum(l.balance for l in ledgers)
    
    return ClientTrustBalance(
        client_id=client.id,
        client_name=client.name,
        total_balance=total_balance,
        ledger_count=len(ledgers)
    )
