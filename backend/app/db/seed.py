"""Datos iniciales repetibles. No restablece contraseñas ni repone stock existente."""

from app.core.config import settings
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.auth.schemas import UserCreate
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository
from app.modules.productos.schemas import ProductoCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CATEGORIAS = (
    ('Hamburguesas', 'Hamburguesas preparadas al momento'),
    ('Acompañamientos', 'Para acompañar tu pedido'),
    ('Bebidas', 'Bebidas frías y calientes'),
)
# categoría, nombre, descripción, precio, stock inicial
PRODUCTOS = (
    ('Hamburguesas', 'Hamburguesa clásica', 'Carne, lechuga y tomate', 6500, 20),
    ('Hamburguesas', 'Hamburguesa con queso', 'Carne y queso cheddar', 7200, 20),
    ('Hamburguesas', 'Hamburguesa vegetariana', 'Medallón vegetal con ensalada', 6800, 15),
    ('Acompañamientos', 'Papas fritas', 'Porción individual', 3000, 30),
    ('Acompañamientos', 'Aros de cebolla', 'Porción individual', 3500, 20),
    ('Bebidas', 'Agua mineral', 'Botella de 500 ml', 1800, 40),
    ('Bebidas', 'Gaseosa', 'Botella de 500 ml', 2200, 40),
    ('Bebidas', 'Café', 'Café caliente', 2000, 25),
)


class CatalogoSeedUnitOfWork(UnitOfWork):
    def _init_repositories(self) -> None:
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)


def seed_admin(uow: UsuarioUnitOfWork | None = None) -> UserPublic:
    data = UserCreate(
        username='admin', full_name='Administrador Food Store',
        email='admin.foodstore@example.com', password=settings.SEED_ADMIN_PASSWORD,
    )
    if uow is None:
        uow = UsuarioUnitOfWork()
    with uow as work:
        existing = work.usuarios.get_by_username(data.username)
        if existing is not None:
            if existing.role != 'admin':
                raise RuntimeError("Ya existe 'admin' con otro rol. No se promoverá automáticamente esa cuenta.")
            return UserPublic.model_validate(existing)
        if work.usuarios.get_by_email(str(data.email)) is not None:
            raise RuntimeError('El email del administrador inicial ya pertenece a otra cuenta')
        user = Usuario(
            username=data.username, full_name=data.full_name, email=str(data.email),
            hashed_password=hash_password(data.password), role='admin', disabled=False,
        )
        work.usuarios.add(user)
        work.flush()
        return UserPublic.model_validate(user)


def seed_catalogo(uow: CatalogoSeedUnitOfWork | None = None) -> dict[str, int]:
    if uow is None:
        uow = CatalogoSeedUnitOfWork()
    resultado = {'categorias_creadas': 0, 'productos_creados': 0, 'productos_omitidos_categoria_inactiva': 0}
    with uow as work:
        categorias = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = work.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                work.categorias.add(categoria)
                work.flush()
                resultado['categorias_creadas'] += 1
            categorias[nombre] = categoria
        for categoria_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            categoria = categorias[categoria_nombre]
            if not categoria.activo:
                resultado['productos_omitidos_categoria_inactiva'] += 1
                continue
            if work.productos.get_by_nombre_y_categoria(nombre, categoria.id) is not None:
                continue
            data = ProductoCreate(
                categoria_id=categoria.id, nombre=nombre, descripcion=descripcion,
                precio_base=precio, stock=stock, disponible=True, imagen_url='',
            )
            work.productos.add(Producto(**data.model_dump()))
            resultado['productos_creados'] += 1
        work.flush()
    return resultado


def main() -> None:
    create_all_tables()
    admin = seed_admin()
    resultado = seed_catalogo()
    print(f'Administrador disponible: {admin.username} (id={admin.id}).')
    print(f"Categorías nuevas: {resultado['categorias_creadas']}; productos nuevos: {resultado['productos_creados']}.")
    print(f"Productos omitidos por categoría inactiva: {resultado['productos_omitidos_categoria_inactiva']}.")
    print('Se conservan cuentas, precios, stock, disponibilidad y bajas existentes.')


if __name__ == '__main__':
    main()
