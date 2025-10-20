"""add_organizer_name_to_race_events

Revision ID: dc1d6978ef6a
Revises: 51ec5f2c5cf1
Create Date: 2025-10-20 23:10:49.395751

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dc1d6978ef6a'
down_revision: Union[str, Sequence[str], None] = '51ec5f2c5cf1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('race_events', sa.Column('organizer_name', sa.String(length=200), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('race_events', 'organizer_name')
