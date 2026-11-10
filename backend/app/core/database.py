from sqlalchemy import text
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {},
)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    # Importar ejecuta las cinco clases y registra sus tablas antes de crearlas.
    from app.db import models  # noqa: F401
    SQLModel.metadata.create_all(engine)


def comprobar_conexion() -> None:
    with engine.connect() as conexion:
        conexion.execute(text("SELECT 1"))
