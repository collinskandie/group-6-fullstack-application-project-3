"""Phase 3: user roles (email/role) and user-owned favorites (user_id/indicator_id)

Recreates `users` and `favorites` rather than altering them in place — both tables only
ever held Phase 2 seed/dev data, so there's nothing worth preserving across the shape
change, and constraint-renaming on SQLite via batch mode is fragile to guessed names.
Local dev DB should be reseeded after this runs (`python seed.py`).

Revision ID: a1c9e7f3b2d4
Revises: 6a482f8da4d8
Create Date: 2026-07-14 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1c9e7f3b2d4'
down_revision = '6a482f8da4d8'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('favorites')
    op.drop_table('users')

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )

    op.create_table(
        'favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.Column('indicator_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['country_id'], ['countries.id']),
        sa.ForeignKeyConstraint(['indicator_id'], ['indicators.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'user_id', 'country_id', 'indicator_id', name='uq_favorite_user_country_indicator'
        ),
    )


def downgrade():
    op.drop_table('favorites')
    op.drop_table('users')

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=80), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('is_admin', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
    )

    op.create_table(
        'favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('notes', sa.String(length=255), nullable=True),
        sa.Column('country_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['country_id'], ['countries.id']),
        sa.PrimaryKeyConstraint('id'),
    )
