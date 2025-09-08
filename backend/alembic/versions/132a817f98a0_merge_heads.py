"""merge heads

Revision ID: 132a817f98a0
Revises: add_norm_names_001, d2e915333ef2
Create Date: 2025-09-08 00:45:52.945648

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '132a817f98a0'
down_revision: Union[str, Sequence[str], None] = ('add_norm_names_001', 'd2e915333ef2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
