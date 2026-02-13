"""Document management API endpoints."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, or_
from app.api.deps import DBSession, CurrentUser
from app.models.document import Document, DocumentCategory
from app.models.matter import Matter
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentBrief

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_data: DocumentCreate,
    db: DBSession,
    current_user: CurrentUser
) -> DocumentResponse:
    """Create a document record. File upload should be handled separately."""
    
    # Verify matter exists
    result = await db.execute(select(Matter).where(Matter.id == document_data.matter_id))
    matter = result.scalar_one_or_none()
    
    if not matter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    document = Document(
        **document_data.model_dump(),
        uploaded_by_id=current_user.id
    )
    
    db.add(document)
    await db.flush()
    await db.refresh(document)
    
    return DocumentResponse.model_validate(document)


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    db: DBSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    matter_id: Optional[UUID] = None,
    category: Optional[DocumentCategory] = None,
    search: Optional[str] = None
) -> List[DocumentResponse]:
    """List documents with optional filtering."""
    
    query = select(Document)
    
    # Apply filters
    if matter_id:
        query = query.where(Document.matter_id == matter_id)
    if category:
        query = query.where(Document.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Document.name.ilike(search_filter),
                Document.original_filename.ilike(search_filter),
                Document.description.ilike(search_filter)
            )
        )
    
    query = query.order_by(Document.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return [DocumentResponse.model_validate(d) for d in documents]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> DocumentResponse:
    """Get a specific document by ID."""
    
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return DocumentResponse.model_validate(document)


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_data: DocumentUpdate,
    db: DBSession,
    current_user: CurrentUser
) -> DocumentResponse:
    """Update document metadata."""
    
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Apply updates
    update_data = document_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    await db.flush()
    await db.refresh(document)
    
    return DocumentResponse.model_validate(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> None:
    """Delete a document record. Note: This does not delete the actual file."""
    
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # TODO: Delete actual file from storage
    
    await db.delete(document)
    await db.flush()


@router.get("/matter/{matter_id}", response_model=List[DocumentBrief])
async def list_matter_documents(
    matter_id: UUID,
    db: DBSession,
    current_user: CurrentUser
) -> List[DocumentBrief]:
    """Get all documents for a specific matter."""
    
    # Verify matter exists
    result = await db.execute(select(Matter).where(Matter.id == matter_id))
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Matter not found"
        )
    
    query = (
        select(Document)
        .where(Document.matter_id == matter_id)
        .order_by(Document.created_at.desc())
    )
    result = await db.execute(query)
    documents = result.scalars().all()
    
    return [DocumentBrief.model_validate(d) for d in documents]
