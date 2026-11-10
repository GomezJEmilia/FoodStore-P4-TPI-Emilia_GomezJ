from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(Producto, session)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        condiciones = [Producto.activo.is_(True)]
        if search is not None and search.strip():
            condiciones.append(func.lower(Producto.nombre).contains(search.strip().lower(), autoescape=True))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible.is_(disponible))

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        statement = (
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        # No se filtra por Categoria.activo: sus productos conservan su visibilidad.
        return total, list(self.session.exec(statement).all())

    def get_by_id_for_update(self, producto_id: int) -> Producto | None:
        statement = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(statement).first()

    def get_by_nombre_y_categoria(self, nombre: str, categoria_id: int) -> Producto | None:
        """Identifica entradas del seed, incluyendo bajas para no recrearlas."""
        return self.session.exec(select(Producto).where(
            Producto.categoria_id == categoria_id,
            func.lower(func.trim(Producto.nombre)) == nombre.strip().lower(),
        ).order_by(Producto.id)).first()
