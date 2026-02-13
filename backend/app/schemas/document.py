"""Document schemas for API requests/responses."""
from typing import Optional
from uuid import UUID
from pydantic import Field
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.document import DocumentCategory


class DocumentBase(BaseSchema):
    """Base document schema with common fields."""
    
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: DocumentCategory = DocumentCategory.OTHER


class DocumentCreate(DocumentBase):
    """Schema for creating a document record (after file upload)."""
    
    matter_id: UUID
    original_filename: str = Field(..., max_length=255)
    file_path: str = Field(..., max_length=500)
    file_size: int = Field(..., ge=0)
    mime_type: str = Field(..., max_length=100)


class DocumentUpdate(BaseSchema):
    """Schema for updating a document (metadata only)."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[DocumentCategory] = None


class DocumentResponse(DocumentBase, TimestampSchema):
    """Schema for document API responses."""
    
    id: UUID
    matter_id: UUID
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    version: int
    parent_document_id: Optional[UUID]
    uploaded_by_id: Optional[UUID]


class DocumentBrief(BaseSchema):
    """Brief document info for nested responses."""
    
    id: UUID
    name: str
    original_filename: str
    category: DocumentCategory
    file_size: int
    mime_type: str
