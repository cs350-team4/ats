from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from api import crud
from api.db.engine import local_engine
from api.dependencies import GetSession, ManagerBearer
from api.models import GameCreate, GameRead, GameUpdate

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
