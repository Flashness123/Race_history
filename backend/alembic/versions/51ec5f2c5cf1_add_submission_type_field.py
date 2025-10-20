"""add_submission_type_field

Revision ID: 51ec5f2c5cf1
Revises: 5353096dd634
Create Date: 2025-10-20 20:46:27.898739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '51ec5f2c5cf1'
down_revision: Union[str, Sequence[str], None] = '5353096dd634'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('submissions', sa.Column('submission_type', sa.String(20), nullable=False, server_default='NEW'))
    op.execute("UPDATE submissions SET submission_type = 'NEW' WHERE submission_type IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('submissions', 'submission_type')
