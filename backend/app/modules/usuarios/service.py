from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(user) for user in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            usuario.disabled = False
            uow.flush()
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if usuario_id == actor_id:
                raise HTTPException(status_code=400, detail="No podés desactivar tu propia cuenta")
            usuario.disabled = True
            uow.flush()
            return UserPublic.model_validate(usuario)
