from pydantic import EmailStr, field_validator
from pydantic import Field

from app.core.schemas import Schema
from app.core.validators import identificador_limpio, texto_limpio
from app.modules.usuarios.schemas import UserPublic

__all__ = ["UserCreate", "UserPublic", "AuthMessage"]


class UserCreate(Schema):
    username: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=8)

    _limpiar_identificadores = field_validator("username", "email", mode="before")(
        identificador_limpio
    )
    _limpiar_nombre = field_validator("full_name", mode="before")(texto_limpio)

    @field_validator("password")
    @classmethod
    def validar_password(cls, valor: str) -> str:
        # bcrypt solo considera los primeros 72 bytes: rechazamos el exceso.
        if len(valor.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes UTF-8")
        return valor


class AuthMessage(Schema):
    message: str
