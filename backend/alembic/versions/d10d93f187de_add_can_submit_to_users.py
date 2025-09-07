from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "d10d93f187de"
down_revision = "b4848e2d7930"  # keep whatever yours says
branch_labels = None
depends_on = None

def upgrade():
    # 1) add as nullable first, with a server default of TRUE for new rows
    op.add_column(
        "users",
        sa.Column("can_submit", sa.Boolean(), nullable=True, server_default=sa.text("true")),
    )

    # 2) backfill existing rows
    op.execute("UPDATE users SET can_submit = TRUE WHERE can_submit IS NULL;")

    # 3) enforce NOT NULL (and keep default = TRUE for future inserts)
    op.alter_column("users", "can_submit", nullable=False)
    op.alter_column("users", "can_submit", server_default=None)


def downgrade():
    op.drop_column("users", "can_submit")
