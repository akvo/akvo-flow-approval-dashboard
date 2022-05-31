import sqlalchemy as sa
import sqlalchemy.dialects.postgresql as pg


class CastingArray(pg.ARRAY):
    def bind_expression(self, bindvalue):
        return sa.cast(bindvalue, self)
