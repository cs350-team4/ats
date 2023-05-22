from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, insert, select, update

from api.db.engine import client_engine, local_engine
from api.dependencies import GetSession, JWTBearer
from api.models import Client, Coupon, IssueCouponPayload, IssueCouponResponse, Prize
from api.utils import generate_serial

router: APIRouter = APIRouter()


@router.post("/issue-coupon", response_model=IssueCouponResponse)
def issue_coupon(
    *,
    client_info: Annotated[dict, Depends(JWTBearer())],
    client_session: Annotated[Session, Depends(GetSession(client_engine))],
    local_session: Annotated[Session, Depends(GetSession(local_engine))],
    payload: IssueCouponPayload
):
    prize: Prize | None = local_session.get(Prize, payload.prize_id)
    if not prize:
        raise HTTPException(status_code=404, detail="Prize not found")

    if prize.stock == 0:
        raise HTTPException(status_code=409, detail="Prize is out of stock")

    username = client_info["name"]
    stmt = select(Client.ticket_num).where(Client.username == username)
    ticket_num = client_session.exec(stmt).one()

    if prize.price > ticket_num:
        raise HTTPException(status_code=402, detail="Insufficient tickets")

    serial_num = generate_serial()
    while local_session.get(Coupon, serial_num):
        serial_num = generate_serial()

    insert_coupon = insert(Coupon).values(  # type: ignore
        serial_num=serial_num, prize_id=prize.id
    )
    local_session.exec(insert_coupon)  # type: ignore
    local_session.commit()

    update_tickets = (
        update(Client)  # type: ignore
        .values(ticket_num=Client.ticket_num - prize.price)
        .where(Client.username == username)
    )
    client_session.exec(update_tickets)  # type: ignore
    client_session.commit()

    return {"serial_number": serial_num}
