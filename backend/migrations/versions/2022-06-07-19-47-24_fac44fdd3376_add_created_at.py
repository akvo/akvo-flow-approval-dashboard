"""add_created_at

Revision ID: fac44fdd3376
Revises: 4c7f629e94a0
Create Date: 2022-06-07 19:47:24.133068

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fac44fdd3376'
down_revision = '4c7f629e94a0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'data',
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    op.execute("UPDATE data SET created_at = '01-01-1970'")
    op.alter_column('data', 'created_at', nullable=False)


def downgrade():
    op.drop_column('data', 'created_at')
