"""Matter (Case) management API endpoints."""
from typing import List, Optional, Dict, Any
from uuid import UUID
import random
import string
from datetime import datetime, date
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload
from app.api.deps import DBSession, CurrentUser
from app.models.matter import Matter, MatterStatus, PracticeArea, BillingType
from app.models.client import Client
from app.models.user import User
from app.schemas.matter import (
    MatterCreate, 
    MatterUpdate, 
    MatterResponse, 
    MatterDetail,
    MatterBrief
)
from app.schemas.client import ClientBrief
from app.schemas.user import UserBrief

router = APIRouter(prefix="/matters", tags=["Matters"])


def generate_matter_number() -> str:
    """Generate a unique matter number."""
    timestamp = datetime.now().strftime("%Y%m")
    random_part = ''.join(random.choices(string.digits, k=6))
    return f"M-{timestamp}-{random_part}"


@router.post("", response_model=MatterResponse, status_code=status.HTTP_201_CREATED)
async def create_matter(
    matter_data: MatterCreate,
    db: DBSession,
    current_user: CurrentUser
) -> MatterResponse:
    """Create a new matter."""
    
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == matter_data.client_id))
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Verify responsible attorney if provided
    if matter_data.responsible_attorney_id:
        result = await db.execute(
            select(User).where(User.id == matter_data.responsible_attorney_id)
        )
        attorney = result.scalar_one_or_none()
        if not attorney:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Responsible attorney not found"
            )
    
    # Generate unique matter number
    matter_number = generate_matter_number()
    while True:
        result = await db.execute(
            select(Matter).where(Matter.matter_number == matter_number)
        )
        if not result.scalar_one_or_none():
            break
        matter_number = generate_matter_number()
    
    matter = Matter(
        **matter_data.model_dump(),
        matter_number=matter_number,
        status=MatterStatus.INTAKE
    )
    
    db.add(matter)
    await db.flush()
    await db.refresh(matter)
    
    return MatterResponse.model_validate(matter)


@router.get("", response_model=Dict[str, Any])
async def list_matters(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    status: Optional[MatterStatus] = None,
    practice_area: Optional[PracticeArea] = None,
    client_id: Optional[UUID] = None,
    responsible_attorney_id: Optional[UUID] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """List matters with optional filtering, paginated."""
    
    query = select(Matter)
    
    # Apply filters
    if status:
        query = query.where(Matter.status == status)
    if practice_area:
        query = query.where(Matter.practice_area == practice_area)
    if client_id:
        query = query.where(Matter.client_id == client_id)
    if responsible_attorney_id:
        query = query.where(Matter.responsible_attorney_id == responsible_attorney_id)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Matter.name.ilike(search_filter),
                Matter.matter_number.ilike(search_filter),
                Matter.description.ilike(search_filter)
            )
        )
    
    # Count total
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    skip = (page - 1) * per_page
    query = query.order_by(Matter.created_at.desc()).offset(skip).limit(per_page)
    result = await db.execute(query)
    matters = result.scalars().all()

    pages = (total + per_page - 1) // per_page
    return {
        "matters": [MatterResponse.model_validate(m) for m in matters],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{matter_id}", response_model=MatterDetail)
async def get_matter(
    matter_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> MatterDetail:
    """Get a specific matter by ID with full details."""
    
    query = (
        select(Matter)
        .options(
            selectinload(Matter.client),
            selectinload(Matter.responsible_attorney)
        )
        .where(Matter.id == matter_id)
    )
    result = await db.execute(query)
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    # Build response with nested objects
    response_data = MatterResponse.model_validate(matter).model_dump()
    response_data["client"] = ClientBrief.model_validate(matter.client)
    response_data["responsible_attorney"] = (
        UserBrief.model_validate(matter.responsible_attorney)
        if matter.responsible_attorney else None
    )
    
    return MatterDetail(**response_data)


@router.patch("/{matter_id}", response_model=MatterResponse)
async def update_matter(
    matter_id: UUID,
    matter_data: MatterUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> MatterResponse:
    """Update a matter."""
    
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    # Verify responsible attorney if being updated
    update_data = matter_data.model_dump(exclude_unset=True)
    if "responsible_attorney_id" in update_data and update_data["responsible_attorney_id"]:
        result = await db.execute(
            select(User).where(User.id == update_data["responsible_attorney_id"])
        )
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Responsible attorney not found"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(matter, field, value)
    
    await db.flush()
    await db.refresh(matter)
    
    return MatterResponse.model_validate(matter)


@router.post("/{matter_id}/close", response_model=MatterResponse)
async def close_matter(
    matter_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> MatterResponse:
    """Close a matter."""
    
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    if matter.status == MatterStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Matter is already closed"
        )
    
    matter.status = MatterStatus.CLOSED
    matter.close_date = date.today()
    
    await db.flush()
    await db.refresh(matter)
    
    return MatterResponse.model_validate(matter)


@router.post("/{matter_id}/reopen", response_model=MatterResponse)
async def reopen_matter(
    matter_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> MatterResponse:
    """Reopen a closed matter."""
    
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    if matter.status != MatterStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only closed matters can be reopened"
        )
    
    matter.status = MatterStatus.ACTIVE
    matter.close_date = None
    
    await db.flush()
    await db.refresh(matter)
    
    return MatterResponse.model_validate(matter)


@router.delete("/{matter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_matter(
    matter_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> None:
    """Delete a matter. This will also delete all associated documents and time entries."""
    
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    await db.delete(matter)
    await db.flush()
