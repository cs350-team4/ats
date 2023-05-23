from collections.abc import Generator

from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer
from sqlalchemy.engine import Engine
from sqlmodel import Session

from api.utils import decode_jwt


class GetSession:
    def __init__(self, engine: Engine):
        self.engine = engine

    def __call__(self) -> Generator[Session, None, None]:
        with Session(self.engine) as session:  # type: ignore
            yield session

    def __hash__(self) -> int:
        return hash(self.engine)

    def __eq__(self, other: object) -> bool:
        return isinstance(other, GetSession) and self.engine == other.engine


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication.")
            jwt = decode_jwt(credentials.credentials)
            if not jwt:
                raise HTTPException(status_code=403, detail="Invalid authentication.")
            return jwt
        else:
            raise HTTPException(status_code=403, detail="Invalid authentication.")


class ManagerBearer(JWTBearer):
    async def __call__(self, request: Request):
        credentials = await super(ManagerBearer, self).__call__(request)
        if "sub" not in credentials or credentials["sub"] != "manager":
            raise HTTPException(status_code=403, detail="Invalid authentication.")
        return credentials


class StaffBearer(JWTBearer):
    async def __call__(self, request: Request):
        credentials = await super(StaffBearer, self).__call__(request)
        if "sub" not in credentials or (
            credentials["sub"] != "exchange" and credentials["sub"] != "manager"
        ):
            raise HTTPException(status_code=403, detail="Invalid authentication.")
        return credentials
