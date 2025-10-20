"""add_track_record_fields

Revision ID: 30552731bdcd
Revises: 552b91fa6369
Create Date: 2025-10-20 17:22:20.949240

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30552731bdcd'
down_revision: Union[str, Sequence[str], None] = '552b91fa6369'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add track record fields to race_events table
    op.add_column('race_events', sa.Column('track_record_open_name', sa.String(200), nullable=True))
    op.add_column('race_events', sa.Column('track_record_open_time', sa.String(20), nullable=True))
    op.add_column('race_events', sa.Column('track_record_luge_name', sa.String(200), nullable=True))
    op.add_column('race_events', sa.Column('track_record_luge_time', sa.String(20), nullable=True))
    op.add_column('race_events', sa.Column('track_record_woman_name', sa.String(200), nullable=True))
    op.add_column('race_events', sa.Column('track_record_woman_time', sa.String(20), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove track record fields from race_events table
    op.drop_column('race_events', 'track_record_woman_time')
    op.drop_column('race_events', 'track_record_woman_name')
    op.drop_column('race_events', 'track_record_luge_time')
    op.drop_column('race_events', 'track_record_luge_name')
    op.drop_column('race_events', 'track_record_open_time')
    op.drop_column('race_events', 'track_record_open_name')
