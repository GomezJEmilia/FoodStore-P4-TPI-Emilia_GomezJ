from collections.abc import Callable
from types import TracebackType
from typing import Literal, Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Una sesión compartida y una única transacción por operación de negocio."""

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self._session: Session | None = None

    @property
    def session(self) -> Session:
        if self._session is None:
            raise RuntimeError("El Unit of Work debe utilizarse dentro de un bloque with")
        return self._session

    def __enter__(self) -> Self:
        if self._session is not None:
            raise RuntimeError("No se puede anidar el mismo Unit of Work")

        self._session = self._factory()
        try:
            self._init_repositories()
        except BaseException:
            try:
                self.session.rollback()
            finally:
                self._close()
            raise
        return self

    def _init_repositories(self) -> None:
        """Cada UoW de módulo creará aquí sus repositorios con self.session."""

    def flush(self) -> None:
        # Envía cambios y obtiene IDs, pero todavía permite rollback.
        self.session.flush()

    def _close(self) -> None:
        try:
            self.session.close()
        finally:
            self._session = None

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> Literal[False]:
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                try:
                    self.session.commit()
                except BaseException:
                    self.session.rollback()
                    raise
        finally:
            # También se ejecuta si fallan commit o rollback.
            self._close()
        # No oculta la excepción del bloque with.
        return False
