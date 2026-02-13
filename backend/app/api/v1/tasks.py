"""Task management API endpoints."""
from datetime import date, datetime, timedelta
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models import Task, TaskStatus, TaskPriority, User, Matter
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskStatusUpdate,
    TaskAssignmentUpdate,
    TaskBulkUpdate,
    TaskSummary
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    matter_id: Optional[UUID] = None,
    assigned_to_id: Optional[UUID] = None,
    due_before: Optional[date] = None,
    due_after: Optional[date] = None,
    overdue_only: bool = False,
    unassigned_only: bool = False,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """List tasks with filtering and pagination."""
    query = select(Task).options(
        selectinload(Task.assigned_to),
        selectinload(Task.created_by),
        selectinload(Task.matter)
    )
    
    # Apply filters
    if status:
        query = query.where(Task.status == status)
    if priority:
        query = query.where(Task.priority == priority)
    if matter_id:
        query = query.where(Task.matter_id == matter_id)
    if assigned_to_id:
        query = query.where(Task.assigned_to_id == assigned_to_id)
    if due_before:
        query = query.where(Task.due_date <= due_before)
    if due_after:
        query = query.where(Task.due_date >= due_after)
    if overdue_only:
        query = query.where(
            and_(
                Task.due_date < date.today(),
                Task.status.notin_([TaskStatus.COMPLETED, TaskStatus.CANCELLED])
            )
        )
    if unassigned_only:
        query = query.where(Task.assigned_to_id.is_(None))
    if search:
        query = query.where(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            )
        )
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Paginate
    query = query.order_by(Task.due_date.asc().nullslast(), Task.priority.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total or 0,
        page=page,
        per_page=per_page,
        pages=(total or 0 + per_page - 1) // per_page
    )


@router.get("/my", response_model=TaskListResponse)
async def list_my_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[TaskStatus] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """List tasks assigned to the current user."""
    query = select(Task).options(
        selectinload(Task.matter),
        selectinload(Task.created_by)
    ).where(Task.assigned_to_id == current_user.id)
    
    if status:
        query = query.where(Task.status == status)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Order by due date and priority
    query = query.order_by(Task.due_date.asc().nullslast(), Task.priority.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total or 0,
        page=page,
        per_page=per_page,
        pages=(total or 0 + per_page - 1) // per_page
    )


@router.get("/summary", response_model=TaskSummary)
async def get_task_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    matter_id: Optional[UUID] = None
):
    """Get task summary statistics."""
    base_query = select(Task)
    if matter_id:
        base_query = base_query.where(Task.matter_id == matter_id)
    
    result = await db.execute(base_query)
    tasks = result.scalars().all()
    
    today = date.today()
    week_end = today + timedelta(days=7)
    
    # Calculate statistics
    by_status = {}
    by_priority = {}
    overdue_count = 0
    due_today = 0
    due_this_week = 0
    unassigned_count = 0
    
    for task in tasks:
        # By status
        status_key = task.status.value
        by_status[status_key] = by_status.get(status_key, 0) + 1
        
        # By priority
        priority_key = task.priority.value
        by_priority[priority_key] = by_priority.get(priority_key, 0) + 1
        
        # Overdue
        if task.is_overdue:
            overdue_count += 1
        
        # Due dates
        if task.due_date:
            if task.due_date == today:
                due_today += 1
            elif today < task.due_date <= week_end:
                due_this_week += 1
        
        # Unassigned
        if not task.assigned_to_id:
            unassigned_count += 1
    
    return TaskSummary(
        total_tasks=len(tasks),
        by_status=by_status,
        by_priority=by_priority,
        overdue_count=overdue_count,
        due_today=due_today,
        due_this_week=due_this_week,
        unassigned_count=unassigned_count
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task."""
    # Validate matter exists if provided
    if task_in.matter_id:
        matter = await db.get(Matter, task_in.matter_id)
        if not matter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matter not found"
            )
    
    # Validate assignee exists if provided
    if task_in.assigned_to_id:
        assignee = await db.get(User, task_in.assigned_to_id)
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found"
            )
    
    task = Task(
        **task_in.model_dump(),
        created_by_id=current_user.id
    )
    db.add(task)
    await db.commit()
    await db.refresh(task, ["assigned_to", "created_by", "matter"])
    
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task."""
    query = select(Task).options(
        selectinload(Task.assigned_to),
        selectinload(Task.created_by),
        selectinload(Task.matter),
        selectinload(Task.subtasks)
    ).where(Task.id == task_id)
    
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_in.model_dump(exclude_unset=True)
    
    # Track completion
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status == TaskStatus.COMPLETED and task.status != TaskStatus.COMPLETED:
            update_data["completed_at"] = datetime.utcnow()
        elif new_status != TaskStatus.COMPLETED and task.status == TaskStatus.COMPLETED:
            update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    await db.commit()
    await db.refresh(task, ["assigned_to", "created_by", "matter"])
    
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    await db.delete(task)
    await db.commit()


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task as completed."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.status = TaskStatus.COMPLETED
    task.completed_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(task, ["assigned_to", "created_by", "matter"])
    
    return TaskResponse.model_validate(task)


@router.post("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(
    task_id: UUID,
    assignment: TaskAssignmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Assign a task to a user."""
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    if assignment.assigned_to_id:
        assignee = await db.get(User, assignment.assigned_to_id)
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found"
            )
    
    task.assigned_to_id = assignment.assigned_to_id
    
    await db.commit()
    await db.refresh(task, ["assigned_to", "created_by", "matter"])
    
    return TaskResponse.model_validate(task)


@router.post("/bulk-update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    bulk_update: TaskBulkUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple tasks."""
    query = select(Task).where(Task.id.in_(bulk_update.task_ids))
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    if len(tasks) != len(bulk_update.task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more tasks not found"
        )
    
    for task in tasks:
        if bulk_update.status:
            task.status = bulk_update.status
            if bulk_update.status == TaskStatus.COMPLETED:
                task.completed_at = datetime.utcnow()
        if bulk_update.priority:
            task.priority = bulk_update.priority
        if bulk_update.assigned_to_id is not None:
            task.assigned_to_id = bulk_update.assigned_to_id
    
    await db.commit()
    
    # Refresh all tasks
    for task in tasks:
        await db.refresh(task, ["assigned_to", "created_by", "matter"])
    
    return [TaskResponse.model_validate(t) for t in tasks]
