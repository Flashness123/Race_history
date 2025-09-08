from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "d2e915333ef2"
down_revision = "d10d93f187de"
branch_labels = None
depends_on = None

def upgrade():
    # Drop the unique constraint (name must match what exists in DB)
    op.drop_constraint("uq_users_display_name_norm", "users", type_="unique")
    # Create a non-unique index for lookups
    op.create_index("ix_users_display_name_norm", "users", ["display_name_norm"], unique=False)

def downgrade():
    op.drop_index("ix_users_display_name_norm", table_name="users")
    op.create_unique_constraint("uq_users_display_name_norm", "users", ["display_name_norm"])
