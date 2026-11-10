import re
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import settings

_password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenInvalidoError(ValueError):
    """Token inválido, vencido o sin las claims requeridas."""


class TokenClaims(BaseModel):
    sub: str
    exp: int = Field(strict=True)
    iat: int = Field(strict=True)

    @field_validator("sub")
    @classmethod
    def validar_identificador(cls, value: str) -> str:
        if re.fullmatch(r"[1-9][0-9]*", value) is None:
            raise ValueError("El sujeto debe identificar un usuario válido")
        return value


def hash_password(password: str) -> str:
    if not isinstance(password, str) or len(password) < 8:
        raise ValueError("La contraseña debe tener al menos ocho caracteres")
    if len(password.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar 72 bytes UTF-8")
    return _password_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    if not isinstance(password, str) or len(password.encode("utf-8")) > 72:
        return False
    try:
        return _password_context.verify(password, hashed_password)
    except (ValueError, TypeError):
        return False


def create_access_token(
    usuario_id: int,
    expires_delta: timedelta | None = None,
) -> str:
    if type(usuario_id) is not int or usuario_id <= 0:
        raise ValueError("El usuario debe tener un ID positivo")
    now = datetime.now(timezone.utc)
    duration = expires_delta if expires_delta is not None else timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(usuario_id),
        "iat": int(now.timestamp()),
        "exp": int((now + duration).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenClaims:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require_sub": True, "require_exp": True, "require_iat": True},
        )
        return TokenClaims.model_validate(payload)
    except (JWTError, ValidationError, ValueError, TypeError) as error:
        raise TokenInvalidoError("No hay una sesión válida") from error
