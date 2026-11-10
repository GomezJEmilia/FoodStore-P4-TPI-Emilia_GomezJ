from pydantic import field_validator
from pydantic import Field

from app.core.schemas import Schema
from app.core.validators import no_nulo, texto_limpio


class CategoriaCreate(Schema):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = ""

    _limpiar = field_validator("nombre", "descripcion", mode="before")(texto_limpio)


class CategoriaUpdate(Schema):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    _limpiar = field_validator("nombre", "descripcion", mode="before")(texto_limpio)
    _rechazar_null = field_validator("nombre", "descripcion", mode="before")(no_nulo)


class CategoriaRead(Schema):
    id: int
    nombre: str
    descripcion: str
    activo: bool
