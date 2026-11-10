from pydantic import field_validator
from pydantic import Field

from app.core.schemas import Schema
from app.core.validators import imagen_valida, no_nulo, precio_valido, texto_limpio
from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(Schema):
    nombre: str = Field(min_length=1)
    descripcion: str = ""
    precio_base: float = Field(ge=0)
    imagen_url: str = ""
    stock: int = Field(default=0, ge=0, strict=True)
    disponible: bool = Field(default=True, strict=True)
    categoria_id: int = Field(gt=0, strict=True)

    _limpiar = field_validator("nombre", "descripcion", mode="before")(texto_limpio)
    _precio = field_validator("precio_base", mode="before")(precio_valido)
    _imagen = field_validator("imagen_url", mode="before")(imagen_valida)


class ProductoUpdate(Schema):
    nombre: str | None = Field(default=None, min_length=1)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0, strict=True)
    disponible: bool | None = Field(default=None, strict=True)
    categoria_id: int | None = Field(default=None, gt=0, strict=True)

    _limpiar = field_validator("nombre", "descripcion", mode="before")(texto_limpio)
    _precio = field_validator("precio_base", mode="before")(precio_valido)
    _imagen = field_validator("imagen_url", mode="before")(imagen_valida)
    _rechazar_null = field_validator(
        "nombre", "descripcion", "precio_base", "imagen_url", "stock", "disponible", "categoria_id",
        mode="before",
    )(no_nulo)


class ProductoStockUpdate(Schema):
    stock: int | None = Field(default=None, ge=0, strict=True)
    disponible: bool | None = Field(default=None, strict=True)

    _rechazar_null = field_validator("stock", "disponible", mode="before")(no_nulo)


class ProductoRead(Schema):
    id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(Schema):
    total: int = Field(ge=0)
    items: list[ProductoRead]
