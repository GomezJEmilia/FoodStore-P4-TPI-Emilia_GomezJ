from collections.abc import Callable, Sequence
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.base_repository import BaseRepository
from app.core.constants import Rol
from app.core.security import TokenInvalidoError, decode_access_token
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic


def get_auth_uow() -> UnitOfWork:
    return UnitOfWork()


def get_current_user(
    uow: Annotated[UnitOfWork, Depends(get_auth_uow)],
    access_token: Annotated[str | None, Cookie(alias="access_token")] = None,
) -> UserPublic:
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No hay una sesión válida")
    try:
        claims = decode_access_token(access_token)
    except TokenInvalidoError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No hay una sesión válida",
        ) from error

    # Se consulta la cuenta actual: no se confía en un rol guardado en el JWT.
    with uow:
        usuarios = BaseRepository(Usuario, uow.session)
        usuario = usuarios.get_by_id(int(claims.sub))
        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No hay una sesión válida")
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


def require_role(roles: Sequence[Rol]) -> Callable[..., UserPublic]:
    allowed = frozenset(roles)
    if not allowed or not allowed.issubset({"user", "admin"}):
        raise ValueError("Debe indicarse al menos un rol válido")

    def check_role(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado: no tenés permisos para esta operación",
            )
        return usuario

    return check_role


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
