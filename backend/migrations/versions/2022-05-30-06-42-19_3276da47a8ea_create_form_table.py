"""create_form_table

Revision ID: 3276da47a8ea
Revises: c3c7542ae998
Create Date: 2022-05-30 06:42:19.092067

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3276da47a8ea'
down_revision = 'c3c7542ae998'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'form',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('instance', sa.String(), nullable=False),
        sa.Column('survey_id', sa.Integer(), nullable=False),
        sa.Column('prod_id', sa.Integer(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=254), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_form_id'), 'form', ['id'], unique=True)
    op.create_index(op.f('ix_form_prod_id'), 'form', ['prod_id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_form_id'), table_name='form')
    op.drop_index(op.f('ix_form_prod_id'), table_name='form')
    op.drop_table('form')
