from typing import Annotated

from fastapi import APIRouter, Depends, Path

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
UsuarioId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[UserPublic])
def listar(service: UsuarioServiceDep, _actor: AdminUser) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(usuario_id: UsuarioId, service: UsuarioServiceDep, _actor: AdminUser) -> UserPublic:
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(usuario_id: UsuarioId, service: UsuarioServiceDep, actor: AdminUser) -> UserPublic:
    return service.desactivar(usuario_id, actor.id)
