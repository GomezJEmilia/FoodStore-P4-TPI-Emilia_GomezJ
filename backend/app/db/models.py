"""Registro central de las cinco tablas. Importar antes de usar metadata o sesiones."""

from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import DetallePedido, Pedido

__all__ = ["Categoria", "Producto", "Usuario", "Pedido", "DetallePedido"]
