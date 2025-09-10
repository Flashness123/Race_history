"""add bios table

Revision ID: f91bc6badf81
Revises: 132a817f98a0
Create Date: 2025-09-08 13:50:52.789227

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f91bc6badf81'
down_revision: Union[str, Sequence[str], None] = '132a817f98a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "bios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nationality", sa.String(length=2), nullable=True),
        sa.Column("place_of_birth", sa.String(length=160), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
    )
    op.create_index("ix_bios_user_id", "bios", ["user_id"], unique=True)




def downgrade():
    op.drop_index("ix_bios_user_id", table_name="bios")
    op.drop_table("bios")