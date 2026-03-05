"""Client management API endpoints."""
from typing import List, Optional, Dict, Any
from uuid import UUID
import random
import string
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from app.api.deps import DBSession, CurrentUser
from app.models.client import Client, ClientStatus, ClientType
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse, ClientBrief

router = APIRouter(prefix="/clients", tags=["Clients"])


def generate_client_number() -> str:
    """Generate a unique client number."""
    timestamp = datetime.now().strftime("%Y%m")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"C-{timestamp}-{random_part}"


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    db: DBSession,
    current_user: CurrentUser
) -> ClientResponse:
    """Create a new client."""
    
    # Generate unique client number
    client_number = generate_client_number()
    
    # Ensure uniqueness
    while True:
        result = await db.execute(
            select(Client).where(Client.client_number == client_number)
        )
        if not result.scalar_one_or_none():
            break
        client_number = generate_client_number()
    
    client = Client(
        **client_data.model_dump(),
        client_number=client_number,
        status=ClientStatus.ACTIVE
    )
    
    db.add(client)
    await db.flush()
    await db.refresh(client)
    
    return ClientResponse.model_validate(client)


@router.get("", response_model=Dict[str, Any])
async def list_clients(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    status: Optional[ClientStatus] = None,
    client_type: Optional[ClientType] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """List clients with optional filtering, paginated."""
    
    query = select(Client)
    
    # Apply filters
    if status:
        query = query.where(Client.status == status)
    if client_type:
        query = query.where(Client.client_type == client_type)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Client.name.ilike(search_filter),
                Client.client_number.ilike(search_filter),
                Client.email.ilike(search_filter)
            )
        )
    
    # Count total
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()
    
    skip = (page - 1) * per_page
    query = query.order_by(Client.created_at.desc()).offset(skip).limit(per_page)
    result = await db.execute(query)
    clients = result.scalars().all()
    
    pages = (total + per_page - 1) // per_page
    return {
        "clients": [ClientResponse.model_validate(c) for c in clients],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> ClientResponse:
    """Get a specific client by ID."""
    
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return ClientResponse.model_validate(client)


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: UUID,
    client_data: ClientUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> ClientResponse:
    """Update a client."""
    
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Apply updates
    update_data = client_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(client, field, value)
    
    await db.flush()
    await db.refresh(client)
    
    return ClientResponse.model_validate(client)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> None:
    """Delete a client. This will also delete all associated matters."""
    
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    await db.delete(client)
    await db.flush()


@router.post("/{client_id}/conflict-check", response_model=ClientResponse)
async def mark_conflict_check_completed(
    client_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> ClientResponse:
    """Mark conflict check as completed for a client."""
    
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    client.conflict_check_completed = True
    await db.flush()
    await db.refresh(client)
    
    return ClientResponse.model_validate(client)
