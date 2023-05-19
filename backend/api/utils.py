import jwt

from api.settings import settings


def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.PUBLIC_KEY, algorithms=["ES256"])
    except jwt.PyJWTError:
        return None
