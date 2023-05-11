from collections.abc import Generator
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, SQLModel, create_engine

from api import crud
from api.models import GameCreate, GameRead, GameUpdate
from api.settings import settings

assert settings.DATABASE_URI is not None
# pool_pre_ping -> test conn is viable at the start of each conn
engine = create_engine(settings.DATABASE_URI, echo=True, pool_pre_ping=True)


def create_db_and_tables() -> None:
    # TODO: Don't create Client
    SQLModel.metadata.create_all(engine)


# TODO: get client session
def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:  # type: ignore
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
        raise HTTPException(status_code=404, detail="Hero not found")
    return deleted_game
