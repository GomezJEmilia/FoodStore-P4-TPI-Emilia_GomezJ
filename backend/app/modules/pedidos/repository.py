from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(Pedido, session)

    def obtener(self, pedido_id: int, bloquear: bool = False) -> Pedido | None:
        sentencia = select(Pedido).where(Pedido.id == pedido_id).options(selectinload(Pedido.items))
        if bloquear:
            sentencia = sentencia.with_for_update()
        return self.session.exec(sentencia).first()

    def list_by_usuario(
        self, usuario_id: int | None, skip: int, limit: int, estado: str | None,
    ) -> tuple[int, list[Pedido]]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        pedidos = self.session.exec(
            select(Pedido).where(*condiciones).options(selectinload(Pedido.items))
            .order_by(Pedido.id.desc()).offset(skip).limit(limit)
        ).all()
        return total, list(pedidos)

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()

    def contar_desde(self, inicio: datetime, fin: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(
            Pedido.created_at >= inicio, Pedido.created_at < fin,
        )).one()

    def ingresos_entregados(self) -> float:
        return float(self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == 'ENTREGADO')
        ).one())
