from datetime import datetime, timedelta, timezone

from fastapi import Response

from app.core.config import settings

ACCESS_TOKEN_COOKIE = "access_token"
COOKIE_PATH = "/"


def set_access_token_cookie(response: Response, token: str) -> None:
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path=COOKIE_PATH,
        max_age=max_age,
        expires=datetime.now(timezone.utc) + timedelta(seconds=max_age),
    )


def delete_access_token_cookie(response: Response) -> None:
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE,
        path=COOKIE_PATH,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
    )
