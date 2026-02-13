"""Contact management API endpoints."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, or_
from app.api.deps import DBSession, CurrentUser
from app.models.contact import Contact
from app.models.client import Client
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactBrief

router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    db: DBSession,
    current_user: CurrentUser
) -> ContactResponse:
    """Create a new contact for a client."""
    
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == contact_data.client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # If this is set as primary, unset other primary contacts for this client
    if contact_data.is_primary:
        await db.execute(
            select(Contact)
            .where(Contact.client_id == contact_data.client_id, Contact.is_primary == True)
        )
        existing_primary = await db.execute(
            select(Contact).where(
                Contact.client_id == contact_data.client_id,
                Contact.is_primary == True
            )
        )
        for existing in existing_primary.scalars().all():
            existing.is_primary = False
    
    contact = Contact(**contact_data.model_dump())
    
    db.add(contact)
    await db.flush()
    await db.refresh(contact)
    
    return ContactResponse.model_validate(contact)


@router.get("", response_model=List[ContactResponse])
async def list_contacts(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    client_id: Optional[UUID] = None,
    is_primary: Optional[bool] = None,
    is_billing_contact: Optional[bool] = None,
    search: Optional[str] = None
) -> List[ContactResponse]:
    """List contacts with optional filtering."""
    
    query = select(Contact)
    
    # Apply filters
    if client_id:
        query = query.where(Contact.client_id == client_id)
    if is_primary is not None:
        query = query.where(Contact.is_primary == is_primary)
    if is_billing_contact is not None:
        query = query.where(Contact.is_billing_contact == is_billing_contact)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Contact.first_name.ilike(search_filter),
                Contact.last_name.ilike(search_filter),
                Contact.email.ilike(search_filter)
            )
        )
    
    query = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    contacts = result.scalars().all()
    
    return [ContactResponse.model_validate(c) for c in contacts]


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> ContactResponse:
    """Get a specific contact by ID."""
    
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    return ContactResponse.model_validate(contact)


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    contact_data: ContactUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> ContactResponse:
    """Update a contact."""
    
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    update_data = contact_data.model_dump(exclude_unset=True)
    
    # If setting as primary, unset other primary contacts
    if update_data.get("is_primary"):
        existing_primary = await db.execute(
            select(Contact).where(
                Contact.client_id == contact.client_id,
                Contact.is_primary == True,
                Contact.id != contact_id
            )
        )
        for existing in existing_primary.scalars().all():
            existing.is_primary = False
    
    # Apply updates
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    await db.flush()
    await db.refresh(contact)
    
    return ContactResponse.model_validate(contact)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> None:
    """Delete a contact."""
    
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    await db.delete(contact)
    await db.flush()
