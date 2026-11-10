from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(Usuario, session)

    def get_by_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(
            func.lower(func.trim(Usuario.username)) == username.strip().lower()
        )
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(
            func.lower(func.trim(Usuario.email)) == email.strip().lower()
        )
        return self.session.exec(statement).first()

    def list_all(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())
