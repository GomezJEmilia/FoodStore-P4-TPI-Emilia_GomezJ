from datetime import datetime

from pydantic import field_validator
from pydantic import Field

from app.core.constants import EstadoPedido, FormaPago
from app.core.schemas import Schema
from app.core.validators import texto_limpio


class ItemPedidoCreate(Schema):
    producto_id: int = Field(gt=0, strict=True)
    cantidad: int = Field(ge=1, strict=True)


class PedidoCreate(Schema):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None

    _limpiar_direccion = field_validator("direccion_entrega", mode="before")(texto_limpio)

    @field_validator("notas", mode="before")
    @classmethod
    def limpiar_notas(cls, valor: object) -> object:
        if isinstance(valor, str):
            return valor.strip() or None
        return valor

    # Los productos repetidos se rechazan en Service con 400, como pide RN-01.
    # No hacerlo aquí: un ValueError del schema se traduciría en 422.


class DetallePedidoRead(Schema):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(Schema):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(Schema):
    total: int = Field(ge=0)
    items: list[PedidoRead]


class CambioEstado(Schema):
    estado: EstadoPedido


class ResumenPedidos(Schema):
    pendientes: int = Field(ge=0)
    en_preparacion: int = Field(ge=0)
    entregados: int = Field(ge=0)
    cancelados: int = Field(ge=0)
    pedidos_hoy: int = Field(ge=0)
    ingresos_entregados: float = Field(ge=0)
