from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(Categoria, session)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # Incluye inactivas: la baja lógica no libera el nombre.
        statement = select(Categoria).where(
            func.lower(func.trim(Categoria.nombre)) == nombre.strip().lower()
        )
        return self.session.exec(statement).first()

    def list_active(self) -> list[Categoria]:
        statement = select(Categoria).where(Categoria.activo.is_(True)).order_by(Categoria.id)
        return list(self.session.exec(statement).all())

    def get_by_id_for_update(self, categoria_id: int) -> Categoria | None:
        statement = select(Categoria).where(Categoria.id == categoria_id).with_for_update()
        return self.session.exec(statement).first()
