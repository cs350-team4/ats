from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, update

from api import crud
from api.db.engine import client_engine, local_engine
from api.dependencies import GetSession, ManagerBearer
from api.models import (
    Client,
    GameCreate,
    GameRead,
    GameStateEnd,
    GameStateReset,
    GameStateStart,
    GameUpdate,
)
from api.utils import decode_jwt

router: APIRouter = APIRouter()


@router.post("/", response_model=GameRead)
def create_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(GetSession(local_engine)),
    game: GameCreate
):
    return crud.create_game(session, game)


@router.get("/", response_model=list[GameRead])
def read_games(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(GetSession(local_engine))
):
    return crud.get_games(session)


@router.get("/{game_id}", response_model=GameRead)
def read_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(GetSession(local_engine)),
    game_id: int
):
    game = crud.get_game(session, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.patch("/{game_id}", response_model=GameRead)
def update_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(GetSession(local_engine)),
    game_id: int,
    game: GameUpdate
):
    updated_game = crud.update_game(session, game_id, game)
    if not updated_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return updated_game


@router.delete("/{game_id}", response_model=GameRead)
def delete_game(
    *,
    _manager: Annotated[dict, Depends(ManagerBearer())],
    session: Session = Depends(GetSession(local_engine)),
    game_id: int
):
    deleted_game = crud.delete_game(session, game_id)
    if not deleted_game:
        raise HTTPException(status_code=404, detail="Game not found")
    return deleted_game


# game_id -> username
active_games: dict[int, str] = {}


@router.post("/start")
def start_game(
    *, session: Session = Depends(GetSession(local_engine)), payload: GameStateStart
):
    user = decode_jwt(payload.client_token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid JWT")

    game = crud.get_game(session, payload.game_id)
    if not game or payload.password != game.password:
        raise HTTPException(status_code=400, detail="Invalid Game")

    # TODO: Update SDD with 409
    if game.id in active_games:
        raise HTTPException(status_code=409, detail="Game in use")

    assert game.id
    active_games[game.id] = user["name"]
    return Response(status_code=200)


@router.post("/end")
def end_game(
    *,
    client_session: Session = Depends(GetSession(client_engine)),
    session: Session = Depends(GetSession(local_engine)),
    payload: GameStateEnd
):
    user = decode_jwt(payload.client_token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid JWT")

    game = crud.get_game(session, payload.game_id)
    if not game or payload.password != game.password:
        raise HTTPException(status_code=400, detail="Invalid Game")

    if game.id not in active_games:
        raise HTTPException(status_code=400, detail="Game not used by anyone")

    # TODO: Update SDD with 409
    if active_games[game.id] != user["name"]:
        raise HTTPException(status_code=409, detail="Game in use")

    # int() takes floor
    tickets = int(game.exchange_rate * payload.score)
    stmt = (
        # bug in sqlalchemy-stubs: #48
        update(Client)  # type: ignore
        .values(ticket_num=Client.ticket_num + tickets)
        .where(Client.username == user["name"])
    )
    client_session.exec(stmt)  # type: ignore
    client_session.commit()

    active_games.pop(game.id)

    return Response(status_code=200)


@router.post("/reset")
def reset_game(
    *, session: Session = Depends(GetSession(local_engine)), payload: GameStateReset
):
    game = crud.get_game(session, payload.game_id)
    if not game or payload.password != game.password:
        raise HTTPException(status_code=400, detail="Invalid Game")

    active_games.pop(game.id, None)

    return Response(status_code=200)
