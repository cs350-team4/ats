from collections.abc import Generator
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from sqlmodel import Session, SQLModel, create_engine, select

from api.models import Game, GameCreate, GameRead, GameUpdate
from api.settings import Settings

settings = Settings()

# pool_pre_ping -> test conn is viable at the start of each conn
engine = create_engine(settings.db_url, echo=True, pool_pre_ping=True)


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
    db_game = Game.from_orm(game)
    session.add(db_game)
    session.commit()
    session.refresh(db_game)
    return db_game


@app.get("/games/", response_model=List[GameRead])
def read_games(*, session: Session = Depends(get_session)):
    games = session.exec(select(Game)).all()
    return games


@app.get("/games/{game_id}", response_model=GameRead)
def read_game(*, session: Session = Depends(get_session), game_id: int):
    game = session.get(Game, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.patch("/games/{game_id}", response_model=GameRead)
def update_game(
    *, session: Session = Depends(get_session), game_id: int, game: GameUpdate
):
    db_game = session.get(Game, game_id)
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    game_data = game.dict(exclude_unset=True)
    for key, value in game_data.items():
        setattr(db_game, key, value)
    session.add(db_game)
    session.commit()
    session.refresh(db_game)
    return db_game


@app.delete("/games/{game_id}")
def delete_hero(*, session: Session = Depends(get_session), game_id: int):
    hero = session.get(Game, game_id)
    if not hero:
        raise HTTPException(status_code=404, detail="Hero not found")
    session.delete(hero)
    session.commit()
    return {"ok": True}
