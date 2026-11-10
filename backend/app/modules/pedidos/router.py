from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.core.constants import EstadoPedido
from app.core.deps import AdminUser, CurrentUser
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import AccesoDenegado, OperacionInvalida, PedidoService, RecursoNoEncontrado
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
PedidoId = Annotated[int, Path(gt=0)]


def traducir_error(error: ValueError) -> HTTPException:
    codigo = 404 if isinstance(error, RecursoNoEncontrado) else 403 if isinstance(error, AccesoDenegado) else 400
    return HTTPException(status_code=codigo, detail=str(error))


@router.post('', response_model=PedidoRead, status_code=201)
def crear(data: PedidoCreate, service: ServiceDep, actor: CurrentUser) -> PedidoRead:
    try:
        return service.crear(data, actor)
    except (RecursoNoEncontrado, OperacionInvalida) as error:
        raise traducir_error(error) from error


@router.get('', response_model=PedidosPaginados)
def listar(
    service: ServiceDep, actor: CurrentUser,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    return service.listar(actor, skip, limit, estado)


# Ruta estática antes del parámetro numérico.
@router.get('/resumen', response_model=ResumenPedidos)
def resumen(service: ServiceDep, _actor: AdminUser) -> ResumenPedidos:
    return service.resumen()


@router.get('/{pedido_id}', response_model=PedidoRead)
def obtener(pedido_id: PedidoId, service: ServiceDep, actor: CurrentUser) -> PedidoRead:
    try:
        return service.obtener(pedido_id, actor)
    except (RecursoNoEncontrado, AccesoDenegado) as error:
        raise traducir_error(error) from error


@router.patch('/{pedido_id}/estado', response_model=PedidoRead)
def cambiar_estado(
    pedido_id: PedidoId, data: CambioEstado, service: ServiceDep, actor: AdminUser,
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado, actor)
    except (RecursoNoEncontrado, OperacionInvalida, AccesoDenegado) as error:
        raise traducir_error(error) from error


@router.patch('/{pedido_id}/cancelar', response_model=PedidoRead)
def cancelar(pedido_id: PedidoId, service: ServiceDep, actor: CurrentUser) -> PedidoRead:
    try:
        return service.cancelar(pedido_id, actor)
    except (RecursoNoEncontrado, OperacionInvalida, AccesoDenegado) as error:
        raise traducir_error(error) from error
