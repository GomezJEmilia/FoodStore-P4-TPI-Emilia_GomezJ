from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
CategoriaId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[CategoriaRead])
def listar(service: ServiceDep) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(categoria_id: CategoriaId, service: ServiceDep) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear(data: CategoriaCreate, service: ServiceDep, _actor: AdminUser) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(
    categoria_id: CategoriaId, data: CategoriaUpdate, service: ServiceDep, _actor: AdminUser,
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(status_code=409, detail=str(error)) from error


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar(categoria_id: CategoriaId, service: ServiceDep, _actor: AdminUser) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
