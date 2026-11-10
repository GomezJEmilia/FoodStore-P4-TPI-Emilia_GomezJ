from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    def _init_repositories(self) -> None:
        self.categorias = CategoriaRepository(self.session)
