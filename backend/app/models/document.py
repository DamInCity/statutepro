"""Document model for file storage and management."""
import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Enum, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.user import User


class DocumentCategory(str, enum.Enum):
    """Document category types."""
    PLEADING = "pleading"
    CORRESPONDENCE = "correspondence"
    CONTRACT = "contract"
    EVIDENCE = "evidence"
    RESEARCH = "research"
    MEMO = "memo"
    INVOICE = "invoice"
    CLIENT_DOC = "client_document"
    COURT_FILING = "court_filing"
    TEMPLATE = "template"
    OTHER = "other"


class Document(BaseModel):
    """Document/file associated with a matter."""
    
    __tablename__ = "documents"
    
    # File info
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)  # In bytes
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Metadata
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[DocumentCategory] = mapped_column(
        Enum(DocumentCategory, name="document_category", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=DocumentCategory.OTHER,
        nullable=False,
        index=True
    )
    
    # Version control
    version: Mapped[int] = mapped_column(default=1, nullable=False)
    parent_document_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Relationships
    matter_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    matter: Mapped["Matter"] = relationship("Matter", back_populates="documents")
    
    uploaded_by_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    
    # Full-text search (for future AI/search features)
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    def __repr__(self) -> str:
        return f"<Document {self.name}>"
