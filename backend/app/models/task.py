"""Task model for workflow and task management."""
import enum
from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime
from sqlalchemy import String, Text, Enum, Date, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.matter import Matter
    from app.models.user import User


class TaskStatus(str, enum.Enum):
    """Task status values."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskCategory(str, enum.Enum):
    """Task category types."""
    RESEARCH = "research"
    DRAFTING = "drafting"
    REVIEW = "review"
    FILING = "filing"
    MEETING = "meeting"
    CALL = "call"
    DEADLINE = "deadline"
    FOLLOW_UP = "follow_up"
    ADMINISTRATIVE = "administrative"
    OTHER = "other"


class Task(BaseModel):
    """Task for workflow management."""
    
    __tablename__ = "tasks"
    
    # Task details
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Status and priority
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=TaskStatus.TODO,
        nullable=False,
        index=True
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name="task_priority", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=TaskPriority.MEDIUM,
        nullable=False,
        index=True
    )
    category: Mapped[TaskCategory] = mapped_column(
        Enum(TaskCategory, name="task_category", create_constraint=True, values_callable=lambda x: [e.value for e in x]),
        default=TaskCategory.OTHER,
        nullable=False
    )
    
    # Dates
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Estimated vs actual time (in minutes)
    estimated_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actual_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Billable tracking
    is_billable: Mapped[bool] = mapped_column(default=True, nullable=False)
    
    # Relationships
    matter_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("matters.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    matter: Mapped[Optional["Matter"]] = relationship("Matter", back_populates="tasks")
    
    # Assigned to
    assigned_to_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    assigned_to: Mapped[Optional["User"]] = relationship(
        "User", 
        foreign_keys=[assigned_to_id],
        back_populates="assigned_tasks"
    )
    
    # Created by
    created_by_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_tasks"
    )
    
    # Parent task for subtasks
    parent_task_id: Mapped[Optional[UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=True
    )
    parent_task: Mapped[Optional["Task"]] = relationship(
        "Task",
        remote_side="Task.id",
        back_populates="subtasks"
    )
    subtasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="parent_task",
        cascade="all, delete-orphan"
    )
    
    # Tags/labels (stored as comma-separated for simplicity)
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    @property
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        if self.due_date and self.status not in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return self.due_date < date.today()
        return False
    
    @property
    def tag_list(self) -> List[str]:
        """Get tags as a list."""
        if self.tags:
            return [t.strip() for t in self.tags.split(",") if t.strip()]
        return []
    
    def __repr__(self) -> str:
        return f"<Task {self.title}>"
