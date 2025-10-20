"""add_social_media_fields_to_bio

Revision ID: 97b1c02e13e7
Revises: dc1d6978ef6a
Create Date: 2025-10-20 23:30:20.478880

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97b1c02e13e7'
down_revision: Union[str, Sequence[str], None] = 'dc1d6978ef6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('bios', sa.Column('phone_number', sa.String(length=20), nullable=True))
    op.add_column('bios', sa.Column('email', sa.String(length=255), nullable=True))
    op.add_column('bios', sa.Column('instagram', sa.String(length=100), nullable=True))
    op.add_column('bios', sa.Column('facebook', sa.String(length=100), nullable=True))
    op.add_column('bios', sa.Column('youtube', sa.String(length=100), nullable=True))
    op.add_column('bios', sa.Column('tiktok', sa.String(length=100), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('bios', 'tiktok')
    op.drop_column('bios', 'youtube')
    op.drop_column('bios', 'facebook')
    op.drop_column('bios', 'instagram')
    op.drop_column('bios', 'email')
    op.drop_column('bios', 'phone_number')
