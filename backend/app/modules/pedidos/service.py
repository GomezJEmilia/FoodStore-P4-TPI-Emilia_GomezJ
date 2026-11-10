from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic


# Horario del negocio: UTC−03:00. Las fechas de los pedidos siguen guardadas en UTC.
HORARIO_NEGOCIO = timezone(timedelta(hours=-3), name='Argentina')


def rango_dia_negocio(ahora: datetime) -> tuple[datetime, datetime]:
    inicio_local = ahora.astimezone(HORARIO_NEGOCIO).replace(hour=0, minute=0, second=0, microsecond=0)
    return inicio_local.astimezone(timezone.utc), (inicio_local + timedelta(days=1)).astimezone(timezone.utc)


TRANSICIONES = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class RecursoNoEncontrado(ValueError):
    pass


class OperacionInvalida(ValueError):
    pass


class AccesoDenegado(ValueError):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, actor: UserPublic) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise OperacionInvalida('No se puede repetir un producto en el pedido')
        with self.uow as uow:
            pedido = Pedido(
                usuario_id=actor.id, forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega, notas=data.notas,
            )
            uow.pedidos.add(pedido)
            total = Decimal('0.00')
            # Orden estable de bloqueos: dos compras no toman productos en orden inverso.
            for item in sorted(data.items, key=lambda item: item.producto_id):
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise RecursoNoEncontrado('Producto inexistente o dado de baja')
                if not producto.disponible:
                    raise OperacionInvalida(f'El producto {producto.nombre} no está disponible')
                if producto.stock < item.cantidad:
                    raise OperacionInvalida(f'Stock insuficiente para {producto.nombre}')
                precio = Decimal(str(producto.precio_base)).quantize(Decimal('0.01'))
                subtotal = precio * item.cantidad
                producto.stock -= item.cantidad
                pedido.items.append(DetallePedido(
                    producto_id=producto.id, cantidad=item.cantidad,
                    nombre_producto=producto.nombre, precio_unitario=float(precio),
                    subtotal=float(subtotal),
                ))
                total += subtotal
            pedido.total = float(total)
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def listar(self, actor: UserPublic, skip: int, limit: int, estado: str | None) -> PedidosPaginados:
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                None if actor.role == 'admin' else actor.id, skip, limit, estado,
            )
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, actor: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.obtener(pedido_id)
            self._validar_acceso(pedido, actor)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, estado: str, actor: UserPublic) -> PedidoRead:
        if actor.role != 'admin':
            raise AccesoDenegado('Solo el administrador puede cambiar estados')
        with self.uow as uow:
            pedido = uow.pedidos.obtener(pedido_id, bloquear=True)
            self._validar_acceso(pedido, actor)
            self._transicionar(pedido, estado, uow)
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, actor: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.obtener(pedido_id, bloquear=True)
            self._validar_acceso(pedido, actor)
            # El admin puede cancelar cualquier pedido no terminal, también por esta ruta.
            if actor.role != 'admin' and pedido.estado != 'PENDIENTE':
                raise OperacionInvalida('Solo podés cancelar un pedido en PENDIENTE')
            self._transicionar(pedido, 'CANCELADO', uow)
            uow.flush()
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio, fin = rango_dia_negocio(datetime.now(timezone.utc))
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado('PENDIENTE'),
                en_preparacion=uow.pedidos.count_by_estado('EN_PREPARACION'),
                entregados=uow.pedidos.count_by_estado('ENTREGADO'),
                cancelados=uow.pedidos.count_by_estado('CANCELADO'),
                pedidos_hoy=uow.pedidos.contar_desde(inicio, fin),
                ingresos_entregados=round(uow.pedidos.ingresos_entregados(), 2),
            )

    @staticmethod
    def _validar_acceso(pedido: Pedido | None, actor: UserPublic) -> None:
        if pedido is None:
            raise RecursoNoEncontrado('Pedido no encontrado')
        if actor.role != 'admin' and pedido.usuario_id != actor.id:
            raise AccesoDenegado('No podés acceder a un pedido de otro usuario')

    @staticmethod
    def _transicionar(pedido: Pedido, estado: str, uow: PedidoUnitOfWork) -> None:
        if estado not in TRANSICIONES[pedido.estado]:
            raise OperacionInvalida(f'Transición inválida: {pedido.estado} → {estado}')
        if estado == 'CANCELADO':
            for item in sorted(pedido.items, key=lambda item: item.producto_id):
                producto = uow.productos.get_by_id_for_update(item.producto_id)
                if producto is None:
                    raise RecursoNoEncontrado('No se pudo restituir el stock de un producto')
                # También se restituye si el producto fue dado de baja o está no disponible.
                producto.stock += item.cantidad
        pedido.estado = estado
        pedido.updated_at = datetime.now(timezone.utc)
