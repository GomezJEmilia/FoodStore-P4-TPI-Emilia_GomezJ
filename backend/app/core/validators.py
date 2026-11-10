import math
from decimal import Decimal, InvalidOperation

from pydantic import HttpUrl, TypeAdapter

_url_adapter = TypeAdapter(HttpUrl)


def texto_limpio(valor: object) -> object:
    return valor.strip() if isinstance(valor, str) else valor


def identificador_limpio(valor: object) -> object:
    return valor.strip().lower() if isinstance(valor, str) else valor


def no_nulo(valor: object) -> object:
    if valor is None:
        raise ValueError("El campo no admite null; omitilo si no querés modificarlo")
    return valor


def precio_valido(valor: object) -> object:
    if isinstance(valor, bool) or not isinstance(valor, (int, float, str, Decimal)):
        raise ValueError("El precio debe ser un número no negativo con hasta dos decimales")
    try:
        numero = Decimal(str(valor))
        if (
            not numero.is_finite()
            or numero < 0
            or not math.isfinite(float(numero))
            or numero != numero.quantize(Decimal("0.01"))
        ):
            raise ValueError("El precio debe ser finito, no negativo y tener hasta dos decimales")
    except (InvalidOperation, OverflowError) as error:
        raise ValueError("El precio no es válido") from error
    return valor


def imagen_valida(valor: object) -> object:
    valor = texto_limpio(valor)
    if isinstance(valor, str) and valor:
        return str(_url_adapter.validate_python(valor))
    return valor
