"""add_submission_attachments_table

Revision ID: c2a5d8f10b43
Revises: b1e4f9c2d305
Create Date: 2026-04-29 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c2a5d8f10b43'
down_revision: Union[str, Sequence[str], None] = 'b1e4f9c2d305'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('submission_attachments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('submission_id', sa.Integer(), nullable=False),
    sa.Column('uploaded_by_user_id', sa.Integer(), nullable=True),
    sa.Column('original_filename', sa.String(length=260), nullable=False),
    sa.Column('stored_path', sa.String(length=400), nullable=False),
    sa.Column('file_size', sa.Integer(), nullable=False),
    sa.Column('uploaded_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_submission_attachments_submission_id'), 'submission_attachments', ['submission_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_submission_attachments_submission_id'), table_name='submission_attachments')
    op.drop_table('submission_attachments')
