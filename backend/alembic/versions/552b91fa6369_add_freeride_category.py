"""add_freeride_category

Revision ID: 552b91fa6369
Revises: 2a5cf69ce82e
Create Date: 2025-10-09 17:26:36.891121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '552b91fa6369'
down_revision: Union[str, Sequence[str], None] = '2a5cf69ce82e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
