from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    def _init_repositories(self) -> None:
        self.usuarios = UsuarioRepository(self.session)
