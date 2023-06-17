import base64
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from api import crud
from api.db.engine import local_engine
from api.dependencies import GetSession, StaffBearer
from api.models import PrizeCreate, PrizeRead, PrizeUpdate

router: APIRouter = APIRouter(tags=["prize"])


def b64_encode(obj: Any) -> Any:
    return jsonable_encoder(
        obj, custom_encoder={bytes: lambda v: base64.b64encode(v).decode("utf-8")}
    )


@router.get("/", response_model=list[PrizeRead])
def read_prizes(
    *,
    start: int = 0,
    limit: int = 12,
    session: Session = Depends(GetSession(local_engine))
):
    prizes = crud.get_prizes(session, start, limit)
    return b64_encode(prizes)


@router.get("/{prize_id}", response_model=PrizeRead)
def read_prize(*, session: Session = Depends(GetSession(local_engine)), prize_id: int):
    prize = crud.get_prize(session, prize_id)
    if prize is None:
        raise HTTPException(status_code=404, detail="Prize not found")
    return b64_encode(prize)


@router.post("/", response_model=PrizeRead)
def create_prize(
    *,
    _staff: Annotated[dict, Depends(StaffBearer())],
    session: Session = Depends(GetSession(local_engine)),
    prize: PrizeCreate
):
    db_prize = crud.create_prize(session, prize)
    return b64_encode(db_prize)


@router.patch("/{prize_id}", response_model=PrizeRead)
def update_prize(
    *,
    _staff: Annotated[dict, Depends(StaffBearer())],
    session: Session = Depends(GetSession(local_engine)),
    prize_id: int,
    prize: PrizeUpdate
):
    updated_prize = crud.update_prize(session, prize_id, prize)
    if not updated_prize:
        raise HTTPException(status_code=404, detail="Prize not found")
    return b64_encode(updated_prize)


# TODO: Update SDD with new response model
@router.delete("/{prize_id}", response_model=PrizeRead)
def delete_prize(
    *,
    _staff: Annotated[dict, Depends(StaffBearer())],
    session: Session = Depends(GetSession(local_engine)),
    prize_id: int
):
    deleted_prize = crud.delete_prize(session, prize_id)
    if not deleted_prize:
        raise HTTPException(status_code=404, detail="Prize not found")
    return b64_encode(deleted_prize)
