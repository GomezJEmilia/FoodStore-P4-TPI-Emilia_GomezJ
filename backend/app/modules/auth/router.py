from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.cookies import delete_access_token_cookie, set_access_token_cookie
from app.core.deps import CurrentUser
from app.core.security import create_access_token
from app.modules.auth.schemas import AuthMessage, UserCreate, UserPublic
from app.modules.auth.service import AuthService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthServiceDep) -> UserPublic:
    return service.registrar(data)


@router.post("/token", response_model=AuthMessage)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthServiceDep,
) -> AuthMessage:
    usuario = service.autenticar(form.username, form.password)
    token = create_access_token(usuario.id)
    set_access_token_cookie(response, token)
    return AuthMessage(message="Login exitoso")


@router.post("/logout", response_model=AuthMessage)
def logout(response: Response) -> AuthMessage:
    delete_access_token_cookie(response)
    return AuthMessage(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(usuario: CurrentUser) -> UserPublic:
    return usuario
