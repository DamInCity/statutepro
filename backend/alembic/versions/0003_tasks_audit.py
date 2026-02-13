"""Add tasks and audit log tables

Revision ID: 0003_tasks_audit
Revises: 0002_billing_trust
Create Date: 2025-12-31

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0003_tasks_audit'
down_revision: Union[str, None] = '0002_billing_trust'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types for tasks
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'blocked', 'completed', 'cancelled');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE task_category AS ENUM ('research', 'drafting', 'review', 'filing', 'meeting', 'call', 'deadline', 'follow_up', 'administrative', 'other');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'login_failed', 'password_change', 'password_reset', 'upload', 'download', 'view', 'share', 'invoice_sent', 'payment_received', 'trust_deposit', 'trust_withdrawal', 'task_assigned', 'task_completed', 'export', 'import');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('title', sa.String(255), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('status', postgresql.ENUM('todo', 'in_progress', 'review', 'blocked', 'completed', 'cancelled', name='task_status', create_type=False), nullable=False, server_default='todo', index=True),
        sa.Column('priority', postgresql.ENUM('low', 'medium', 'high', 'urgent', name='task_priority', create_type=False), nullable=False, server_default='medium', index=True),
        sa.Column('category', postgresql.ENUM('research', 'drafting', 'review', 'filing', 'meeting', 'call', 'deadline', 'follow_up', 'administrative', 'other', name='task_category', create_type=False), nullable=False, server_default='other'),
        sa.Column('due_date', sa.Date, nullable=True, index=True),
        sa.Column('start_date', sa.Date, nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('estimated_minutes', sa.Integer, nullable=True),
        sa.Column('actual_minutes', sa.Integer, nullable=True),
        sa.Column('is_billable', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('matter_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('matters.id', ondelete='CASCADE'), nullable=True, index=True),
        sa.Column('assigned_to_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('created_by_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('parent_task_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tasks.id', ondelete='CASCADE'), nullable=True),
        sa.Column('tags', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('action', postgresql.ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'login_failed', 'password_change', 'password_reset', 'upload', 'download', 'view', 'share', 'invoice_sent', 'payment_received', 'trust_deposit', 'trust_withdrawal', 'task_assigned', 'task_completed', 'export', 'import', name='audit_action', create_type=False), nullable=False, index=True),
        sa.Column('resource_type', sa.String(50), nullable=False, index=True),
        sa.Column('resource_id', sa.String(50), nullable=True, index=True),
        sa.Column('resource_name', sa.String(255), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('user_email', sa.String(255), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('changes', postgresql.JSONB, nullable=True),
        sa.Column('extra_data', postgresql.JSONB, nullable=True),
        sa.Column('success', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create index for audit log queries
    op.create_index('ix_audit_logs_created_at', 'audit_logs', ['created_at'])


def downgrade() -> None:
    # Drop tables
    op.drop_index('ix_audit_logs_created_at', 'audit_logs')
    op.drop_table('audit_logs')
    op.drop_table('tasks')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS audit_action")
    op.execute("DROP TYPE IF EXISTS task_category")
    op.execute("DROP TYPE IF EXISTS task_priority")
    op.execute("DROP TYPE IF EXISTS task_status")
