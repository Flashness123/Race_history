from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "d2e915333ef2"
down_revision = "d10d93f187de"
branch_labels = None
depends_on = None

def upgrade():
    # Drop either the custom name or Postgres default name, if they exist
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS uq_users_display_name_norm;")
    op.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_display_name_norm_key;")

def downgrade():
    # (Optional) re-add if you really want to restore it on downgrade
    # op.execute("ALTER TABLE users ADD CONSTRAINT uq_users_display_name_norm UNIQUE (display_name_norm);")
    pass