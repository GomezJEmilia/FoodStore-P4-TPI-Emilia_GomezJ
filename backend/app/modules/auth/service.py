from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def es_duplicado_usuario(error: IntegrityError) -> bool:
    constraint = getattr(getattr(error.orig, "diag", None), "constraint_name", None)
    if constraint in {
        "ix_usuarios_username", "ix_usuarios_email",
        "usuarios_username_key", "usuarios_email_key",
    }:
        return True
    # Equivalente para desarrollo y pruebas con SQLite.
    message = str(error.orig).lower()
    return (
        "unique constraint failed: usuarios.username" in message
        or "unique constraint failed: usuarios.email" in message
    )


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(data.username) is not None:
                    raise HTTPException(status_code=409, detail="El nombre de usuario ya está registrado")
                if uow.usuarios.get_by_email(str(data.email)) is not None:
                    raise HTTPException(status_code=409, detail="El email ya está registrado")

                usuario = Usuario(
                    username=data.username,
                    full_name=data.full_name,
                    email=str(data.email),
                    hashed_password=hash_password(data.password),
                    role="user",
                    disabled=False,
                )
                uow.usuarios.add(usuario)
                uow.flush()
                return UserPublic.model_validate(usuario)
        except IntegrityError as error:
            # También cubre dos registros simultáneos con el mismo identificador.
            if es_duplicado_usuario(error):
                raise HTTPException(
                    status_code=409,
                    detail="El nombre de usuario o el email ya están registrados",
                ) from error
            raise

    def autenticar(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )
            if usuario.disabled:
                raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
            return UserPublic.model_validate(usuario)
