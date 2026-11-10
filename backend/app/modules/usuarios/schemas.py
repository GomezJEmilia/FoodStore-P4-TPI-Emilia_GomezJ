from datetime import datetime

from app.core.constants import Rol
from app.core.schemas import Schema


class UserPublic(Schema):
    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime
