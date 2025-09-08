# alembic revision -m "add normalized names for bios"
from alembic import op
import sqlalchemy as sa

revision = "add_norm_names_001"
down_revision = "d10d93f187de"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("users", sa.Column("display_name", sa.String(length=160), nullable=True))
    op.add_column("users", sa.Column("display_name_norm", sa.String(length=160), nullable=True))
    op.create_unique_constraint("uq_users_display_name_norm", "users", ["display_name_norm"])

    op.add_column("people", sa.Column("full_name_norm", sa.String(length=160), nullable=True))
    op.create_index("ix_people_full_name_norm", "people", ["full_name_norm"])

    # backfill existing rows using PostgreSQL regex (letters+digits only)
    op.execute("""
      UPDATE users
      SET display_name = COALESCE(display_name, name),
          display_name_norm = NULLIF(regexp_replace(lower(COALESCE(display_name, name, '')), '[^a-z0-9]+', '', 'g'), '')
    """)
    op.execute("""
      UPDATE people
      SET full_name_norm = NULLIF(regexp_replace(lower(COALESCE(full_name, '')), '[^a-z0-9]+', '', 'g'), '')
    """)

def downgrade():
    op.drop_index("ix_people_full_name_norm", table_name="people")
    op.drop_column("people", "full_name_norm")
    op.drop_constraint("uq_users_display_name_norm", "users", type_="unique")
    op.drop_column("users", "display_name_norm")
    op.drop_column("users", "display_name")
