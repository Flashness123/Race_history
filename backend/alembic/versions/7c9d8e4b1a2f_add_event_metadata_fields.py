"""add_event_metadata_fields

Revision ID: 7c9d8e4b1a2f
Revises: ee438735edba
Create Date: 2026-03-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7c9d8e4b1a2f"
down_revision: Union[str, Sequence[str], None] = "ee438735edba"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("race_events", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("race_events", sa.Column("spot_notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("race_events", "spot_notes")
    op.drop_column("race_events", "description")
