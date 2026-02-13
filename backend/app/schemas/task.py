"""Task schemas for API validation."""
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from app.models.task import TaskStatus, TaskPriority, TaskCategory


class TaskBase(BaseModel):
    """Base task schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    category: TaskCategory = TaskCategory.OTHER
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_minutes: Optional[int] = Field(None, ge=0)
    is_billable: bool = True
    matter_id: Optional[UUID] = None
    assigned_to_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    tags: Optional[str] = Field(None, max_length=500)


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None
    due_date: Optional[date] = None
    start_date: Optional[date] = None
    estimated_minutes: Optional[int] = Field(None, ge=0)
    actual_minutes: Optional[int] = Field(None, ge=0)
    is_billable: Optional[bool] = None
    matter_id: Optional[UUID] = None
    assigned_to_id: Optional[UUID] = None
    parent_task_id: Optional[UUID] = None
    tags: Optional[str] = Field(None, max_length=500)


class TaskAssignee(BaseModel):
    """Embedded user info for task response."""
    id: UUID
    email: str
    first_name: str
    last_name: str
    
    class Config:
        from_attributes = True


class TaskMatter(BaseModel):
    """Embedded matter info for task response."""
    id: UUID
    matter_number: str
    name: str
    
    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    """Response schema for a task."""
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    category: TaskCategory
    due_date: Optional[date]
    start_date: Optional[date]
    completed_at: Optional[datetime]
    estimated_minutes: Optional[int]
    actual_minutes: Optional[int]
    is_billable: bool
    is_overdue: bool
    tags: Optional[str]
    tag_list: List[str]
    
    # Relationships
    matter_id: Optional[UUID]
    matter: Optional[TaskMatter] = None
    assigned_to_id: Optional[UUID]
    assigned_to: Optional[TaskAssignee] = None
    created_by_id: Optional[UUID]
    created_by: Optional[TaskAssignee] = None
    parent_task_id: Optional[UUID]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """Response for task list."""
    tasks: List[TaskResponse]
    total: int
    page: int
    per_page: int
    pages: int


class TaskStatusUpdate(BaseModel):
    """Schema for updating just the status."""
    status: TaskStatus


class TaskAssignmentUpdate(BaseModel):
    """Schema for assigning a task."""
    assigned_to_id: Optional[UUID] = None


class TaskBulkUpdate(BaseModel):
    """Schema for bulk updating tasks."""
    task_ids: List[UUID]
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assigned_to_id: Optional[UUID] = None


class TaskSummary(BaseModel):
    """Summary statistics for tasks."""
    total_tasks: int
    by_status: dict[str, int]
    by_priority: dict[str, int]
    overdue_count: int
    due_today: int
    due_this_week: int
    unassigned_count: int
