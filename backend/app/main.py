from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.database import create_all_tables, engine


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        create_all_tables()
        yield
    finally:
        engine.dispose()


app = FastAPI(
    title="Food Store — TPI Programación IV",
    version="0.1.0",
    description="Infraestructura y modelos listos. Los endpoints de negocio se incorporan por módulos.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(api_router)
