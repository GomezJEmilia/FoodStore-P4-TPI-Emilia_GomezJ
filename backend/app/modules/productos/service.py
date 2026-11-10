from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(ValueError):
    """El producto no existe o está inactivo."""


class CategoriaNoEncontrada(ValueError):
    """La categoría indicada no existe o está inactiva."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self, skip: int = 0, limit: int = 20, search: str | None = None,
        categoria_id: int | None = None, disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id_for_update(data.categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada o dada de baja")
            producto = Producto(**data.model_dump())
            producto.categoria = categoria
            uow.productos.add(producto)
            uow.flush()
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            cambios = data.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                categoria = uow.categorias.get_by_id_for_update(cambios["categoria_id"])
                if categoria is None or not categoria.activo:
                    raise CategoriaNoEncontrada("Categoría no encontrada o dada de baja")
                producto.categoria = categoria
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.flush()
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            for campo, valor in data.model_dump(exclude_unset=True).items():
                setattr(producto, campo, valor)
            uow.flush()
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id_for_update(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.flush()
