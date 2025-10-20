"""add_category_to_results

Revision ID: 5353096dd634
Revises: d0d6832100f4
Create Date: 2025-10-20 19:48:13.244651

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5353096dd634'
down_revision: Union[str, Sequence[str], None] = 'd0d6832100f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add category column to results table
    op.add_column('results', sa.Column('category', sa.String(20), nullable=True))
    
    # Update existing results to have 'OPEN' as default category
    op.execute("UPDATE results SET category = 'OPEN' WHERE category IS NULL")


def downgrade() -> None:
    """Downgrade schema."""
    # Remove category column from results table
    op.drop_column('results', 'category')
