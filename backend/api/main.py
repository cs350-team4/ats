from collections.abc import Generator
from datetime import datetime, timezone
from typing import Annotated, List

import bcrypt
import jwt
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from jwt import PyJWTError
from sqlmodel import Session, create_engine, select

from api import crud
from api.models import (
    Client,
    GameCreate,
    GameRead,
    GameUpdate,
    GenerateToken,
    OwnedModel,
)
from api.settings import settings

assert settings.DATABASE_URI is not None
# pool_pre_ping -> test conn is viable at the start of each conn
engine = create_engine(settings.DATABASE_URI, echo=True, pool_pre_ping=True)

assert settings.CLIENT_DB_URI is not None
client_engine = create_engine(settings.CLIENT_DB_URI, echo=True, pool_pre_ping=True)


def create_db_and_tables() -> None:
    OwnedModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:  # type: ignore
        yield session


def get_client_session() -> Generator[Session, None, None]:
    with Session(client_engine) as session:  # type: ignore
        yield session


def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.PUBLIC_KEY, algorithms=["ES256"])
    except PyJWTError:
        return None


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
        if "sub" not in credentials and credentials["sub"] != "manager":
            raise HTTPException(status_code=403, detail="Invalid authentication.")
        return credentials


class StaffBearer(JWTBearer):
    async def __call__(self, request: Request):
        credentials = await super(StaffBearer, self).__call__(request)
        if "sub" not in credentials and (
            credentials["sub"] != "exchange" or credentials["sub"] != "manager"
        ):
            raise HTTPException(status_code=403, detail="Invalid authentication.")
        return credentials


origins = ["http://localhost:6006", "http://localhost:3000"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.post("/games/", response_model=GameRead)
def create_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(get_session),
    game: GameCreate
):
    return crud.create_game(session, game)


@app.get("/games/", response_model=List[GameRead])
def read_games(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(get_session)
):
    return crud.get_games(session)


@app.get("/games/{game_id}", response_model=GameRead)
def read_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(get_session),
    game_id: int
):
    game = crud.get_game(session, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.patch("/games/{game_id}", response_model=GameRead)
def update_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(get_session),
    game_id: int,
    game: GameUpdate
):
    updated_game = crud.update_game(session, game_id, game)
    if not updated_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return updated_game


@app.delete("/games/{game_id}", response_model=GameRead)
def delete_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(get_session),
    game_id: int
):
    deleted_game = crud.delete_game(session, game_id)
    if not deleted_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return deleted_game


@app.post("/auth/generateToken")
def generate_token(
    *, session: Session = Depends(get_client_session), payload: GenerateToken
):
    stmt = select(Client).where(Client.username == payload.username)
    result = session.exec(stmt).first()
    if result is None:
        raise HTTPException(status_code=403, detail="Authentication failed")
    if bcrypt.checkpw(payload.password.encode("utf8"), result.password.encode("utf8")):
        jwToken = jwt.encode(
            {"name": result.username, "iat": datetime.now(tz=timezone.utc)},
            settings.PRIVATE_KEY,
            algorithm="ES256",
        )
        return {"auth_token": jwToken}
    else:
        raise HTTPException(status_code=403, detail="Authentication failed")


@app.get("/auth/publicKey")
def public_key():
    return {"publicKey": settings.PUBLIC_KEY}
