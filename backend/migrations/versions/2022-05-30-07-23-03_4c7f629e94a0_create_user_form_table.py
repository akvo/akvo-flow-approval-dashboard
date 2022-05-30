"""create_user_device_table

Revision ID: 4c7f629e94a0
Revises: face57b740bd
Create Date: 2022-05-30 07:23:03.614782

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4c7f629e94a0'
down_revision = 'face57b740bd'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_device', sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user',
                  sa.Integer(),
                  sa.ForeignKey('user.id', ondelete="CASCADE"),
                  nullable=False),
        sa.Column('device', sa.String(length=254), nullable=False),
        sa.ForeignKeyConstraint(['user'], ['user.id'],
                                name='user_device_user_constraint'))
    op.create_index(op.f('ix_user_device_id'),
                    'user_device', ['id'],
                    unique=True)


def downgrade():
    op.drop_index(op.f('ix_user_device_id'), table_name='user_device')
    op.drop_table('user_device')
