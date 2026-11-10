from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(ValueError):
    """La categoría no existe o está inactiva."""


class NombreDuplicado(ValueError):
    """Otra categoría, incluso inactiva, tiene ese nombre."""


def es_nombre_duplicado(error: IntegrityError) -> bool:
    constraint = getattr(getattr(error.orig, "diag", None), "constraint_name", None)
    if constraint == "uq_categorias_nombre_normalizado":
        return True
    message = str(error.orig).lower()
    return "unique constraint failed" in message and "uq_categorias_nombre_normalizado" in message


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(cat) for cat in uow.categorias.list_active()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(categoria_id)
            if cat is None or not cat.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(cat)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                existente = uow.categorias.get_by_nombre(data.nombre)
                if existente is not None:
                    self._rechazar_duplicado(existente)
                cat = Categoria(**data.model_dump())
                uow.categorias.add(cat)
                uow.flush()
                return CategoriaRead.model_validate(cat)
        except IntegrityError as error:
            if es_nombre_duplicado(error):
                raise NombreDuplicado("El nombre ya pertenece a otra categoría, activa o inactiva") from error
            raise

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                cat = uow.categorias.get_by_id_for_update(categoria_id)
                if cat is None or not cat.activo:
                    raise CategoriaNoEncontrada("Categoría no encontrada")
                cambios = data.model_dump(exclude_unset=True)
                if "nombre" in cambios:
                    existente = uow.categorias.get_by_nombre(cambios["nombre"])
                    if existente is not None and existente.id != cat.id:
                        self._rechazar_duplicado(existente)
                for campo, valor in cambios.items():
                    setattr(cat, campo, valor)
                uow.flush()
                return CategoriaRead.model_validate(cat)
        except IntegrityError as error:
            if es_nombre_duplicado(error):
                raise NombreDuplicado("El nombre ya pertenece a otra categoría, activa o inactiva") from error
            raise

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            cat = uow.categorias.get_by_id_for_update(categoria_id)
            if cat is None or not cat.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            cat.activo = False
            # No modifica ni elimina los productos que pertenecen a la categoría.
            uow.flush()

    @staticmethod
    def _rechazar_duplicado(existente: Categoria) -> None:
        if not existente.activo:
            raise NombreDuplicado("El nombre pertenece a una categoría dada de baja")
        raise NombreDuplicado("Ya existe una categoría con ese nombre")
