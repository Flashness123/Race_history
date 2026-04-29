"""add_event_attachments_table

Revision ID: b1e4f9c2d305
Revises: a3f8c12d9e47
Create Date: 2026-04-29 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b1e4f9c2d305'
down_revision: Union[str, Sequence[str], None] = 'a3f8c12d9e47'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('event_attachments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('uploaded_by_user_id', sa.Integer(), nullable=True),
    sa.Column('original_filename', sa.String(length=260), nullable=False),
    sa.Column('stored_path', sa.String(length=400), nullable=False),
    sa.Column('file_size', sa.Integer(), nullable=False),
    sa.Column('uploaded_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['race_events.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_event_attachments_event_id'), 'event_attachments', ['event_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_event_attachments_event_id'), table_name='event_attachments')
    op.drop_table('event_attachments')
