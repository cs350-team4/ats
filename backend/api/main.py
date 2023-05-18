from collections.abc import Generator
from datetime import datetime
from typing import List

import bcrypt
import jwt
from fastapi import Depends, FastAPI, HTTPException
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
# TODO: make type checker pass
client_engine = create_engine(settings.CLIENT_DB_URI, echo=True, pool_pre_ping=True)  # type: ignore


def create_db_and_tables() -> None:
    # TODO: Don't create Client
    OwnedModel.metadata.create_all(engine)


# TODO: get client session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:  # type: ignore
        yield session


def get_client_session() -> Generator[Session, None, None]:
    with Session(client_engine) as session:  # type: ignore
        yield session


app = FastAPI()


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.post("/games/", response_model=GameRead)
def create_game(*, session: Session = Depends(get_session), game: GameCreate):
    return crud.create_game(session, game)


@app.get("/games/", response_model=List[GameRead])
def read_games(*, session: Session = Depends(get_session)):
    return crud.get_games(session)


@app.get("/games/{game_id}", response_model=GameRead)
def read_game(*, session: Session = Depends(get_session), game_id: int):
    game = crud.get_game(session, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.patch("/games/{game_id}", response_model=GameRead)
def update_game(
    *, session: Session = Depends(get_session), game_id: int, game: GameUpdate
):
    updated_game = crud.update_game(session, game_id, game)
    if not updated_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return updated_game


@app.delete("/games/{game_id}", response_model=GameRead)
def delete_game(*, session: Session = Depends(get_session), game_id: int):
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
        # TODO: remove this when type changes in settings
        assert settings.PRIVATE_KEY is not None
        jwToken = jwt.encode(
            {"name": result.username, "iat": datetime.now()},
            settings.PRIVATE_KEY,
            algorithm="ES256",
        )
        return {"auth_token": jwToken}
    else:
        raise HTTPException(status_code=403, detail="Authentication failed")


@app.get("/auth/publicKey")
def public_key():
    return {"publicKey": settings.PUBLIC_KEY}
