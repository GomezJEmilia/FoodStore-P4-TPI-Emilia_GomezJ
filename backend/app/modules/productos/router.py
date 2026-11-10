from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import AdminUser
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
ProductoId = Annotated[int, Path(gt=0)]


@router.get("", response_model=ProductosPaginados)
def listar(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: Annotated[int | None, Query(gt=0)] = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(producto_id: ProductoId, service: ServiceDep) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear(data: ProductoCreate, service: ServiceDep, _actor: AdminUser) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(
    producto_id: ProductoId, data: ProductoUpdate, service: ServiceDep, _actor: AdminUser,
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: ProductoId, data: ProductoStockUpdate, service: ServiceDep, _actor: AdminUser,
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(producto_id: ProductoId, service: ServiceDep, _actor: AdminUser) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
