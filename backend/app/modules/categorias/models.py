from typing import TYPE_CHECKING

from sqlalchemy import Index, text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"
    __table_args__ = (
        Index("uq_categorias_nombre_normalizado", text("lower(trim(nombre))"), unique=True),
    )

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="")
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
