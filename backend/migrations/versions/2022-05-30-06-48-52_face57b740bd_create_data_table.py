"""create_data_table

Revision ID: face57b740bd
Revises: eb28cc560219
Create Date: 2022-05-30 06:48:52.329534

"""
from alembic import op
import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg

# revision identifiers, used by Alembic.
revision = 'face57b740bd'
down_revision = 'eb28cc560219'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'data', sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('form',
                  sa.Integer(),
                  sa.ForeignKey('form.id', ondelete="CASCADE"),
                  nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('device', sa.String(), nullable=False),
        sa.Column('value', pg.JSONB(), nullable=False),
        sa.Column('status',
                  sa.Enum('pending',
                          'approved',
                          'rejected',
                          name='data_approval_status'),
                  nullable=False), sa.PrimaryKeyConstraint('id'),
        sa.Column('approved_by', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['approved_by'], ['user.id'],
                                name='approved_by_data_constraint'),
        sa.ForeignKeyConstraint(['form'], ['form.id'],
                                name='form_data_constraint'))
    op.create_index(op.f('ix_data_id'), 'data', ['id'], unique=True)


def downgrade():
    op.drop_index(op.f('ix_data_id'), table_name='data')
    op.drop_table('data')
    op.execute('DROP TYPE data_approval_status')
