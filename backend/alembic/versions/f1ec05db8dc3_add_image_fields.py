"""add image fields

Revision ID: f1ec05db8dc3
Revises: f91bc6badf81
Create Date: 2025-09-11 22:28:19.947402

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1ec05db8dc3'
down_revision: Union[str, Sequence[str], None] = 'f91bc6badf81'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("users", sa.Column("profile_image_url", sa.String(length=400), nullable=True))
    op.add_column("race_events", sa.Column("image_url", sa.String(length=400), nullable=True))


def downgrade():
    op.drop_column("race_events", "image_url")
    op.drop_column("users", "profile_image_url")

