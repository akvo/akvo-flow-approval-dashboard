"""create_unlisted_question

Revision ID: cbebdd07ef7d
Revises: fac44fdd3376
Create Date: 2022-06-13 06:47:18.992984

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'cbebdd07ef7d'
down_revision = 'fac44fdd3376'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'unlisted_question', sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('variable', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'))
    op.create_index(op.f('ix_unlisted_question_id'),
                    'unlisted_question', ['id'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_unlisted_question_id'),
                  table_name='unlisted_question')
    op.drop_table('unlisted_question')
