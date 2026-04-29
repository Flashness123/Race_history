"""add_spot_runs_table

Revision ID: a3f8c12d9e47
Revises: 7c9d8e4b1a2f
Create Date: 2026-04-29 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f8c12d9e47'
down_revision: Union[str, Sequence[str], None] = '7c9d8e4b1a2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('spot_runs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('uploaded_by_user_id', sa.Integer(), nullable=True),
    sa.Column('rider_name', sa.String(length=160), nullable=False),
    sa.Column('duration_ms', sa.Integer(), nullable=False),
    sa.Column('max_speed_kmh', sa.Float(), nullable=False),
    sa.Column('avg_speed_kmh', sa.Float(), nullable=False),
    sa.Column('track_points', sa.JSON(), nullable=False),
    sa.Column('raw_file_path', sa.String(length=400), nullable=True),
    sa.Column('run_date', sa.DateTime(), nullable=True),
    sa.Column('uploaded_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['race_events.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['uploaded_by_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_spot_runs_event_id'), 'spot_runs', ['event_id'], unique=False)
    op.create_index(op.f('ix_spot_runs_uploaded_by_user_id'), 'spot_runs', ['uploaded_by_user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_spot_runs_uploaded_by_user_id'), table_name='spot_runs')
    op.drop_index(op.f('ix_spot_runs_event_id'), table_name='spot_runs')
    op.drop_table('spot_runs')
