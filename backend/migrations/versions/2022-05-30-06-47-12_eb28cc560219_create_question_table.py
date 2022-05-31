"""create_question_table

Revision ID: eb28cc560219
Revises: 3276da47a8ea
Create Date: 2022-05-30 06:47:12.848577

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'eb28cc560219'
down_revision = '3276da47a8ea'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'question', sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('form',
                  sa.Integer(),
                  sa.ForeignKey('form.id', ondelete="CASCADE"),
                  nullable=False),
        sa.Column('prod_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_question_constraint'))
    op.create_index(op.f('ix_question_id'), 'question', ['id'], unique=True)
    op.create_index(op.f('ix_question_prod_id'),
                    'question', ['prod_id'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_question_id'), table_name='question')
    op.drop_index(op.f('ix_question_prod_id'), table_name='question')
    op.drop_table('question')
