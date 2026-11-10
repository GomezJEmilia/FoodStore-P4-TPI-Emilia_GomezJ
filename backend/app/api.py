"""Registro central: los routers de los módulos se incorporarán aquí."""

import logging

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import comprobar_conexion
from app.core.schemas import Schema
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router

logger = logging.getLogger(__name__)
api_router = APIRouter(prefix="/api/v1")


class HealthRead(Schema):
    status: str
    database: str


@api_router.get("/health", response_model=HealthRead, tags=["Infraestructura"])
def health() -> HealthRead:
    try:
        comprobar_conexion()
    except SQLAlchemyError as error:
        logger.exception("No fue posible conectar con PostgreSQL")
        raise HTTPException(status_code=503, detail="No fue posible conectar con la base de datos") from error
    return HealthRead(status="ok", database="connected")


api_router.include_router(auth_router)
api_router.include_router(usuarios_router)

api_router.include_router(categorias_router)
api_router.include_router(productos_router)

api_router.include_router(pedidos_router)
