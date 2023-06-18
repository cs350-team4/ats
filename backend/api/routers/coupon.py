from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel import Session, insert, select, update

from api.db.engine import client_engine, local_engine
from api.dependencies import GetSession, JWTBearer, StaffBearer
from api.models import Client, Coupon, IssueCouponPayload, IssueCouponResponse, Prize
from api.utils import generate_serial

router: APIRouter = APIRouter(tags=["coupon"])

recently_issued_coupons = {}


@router.post("/issue", response_model=IssueCouponResponse)
def issue_coupon(
    *,
    client_info: Annotated[dict, Depends(JWTBearer())],
    client_session: Annotated[Session, Depends(GetSession(client_engine))],
    local_session: Annotated[Session, Depends(GetSession(local_engine))],
    payload: IssueCouponPayload,
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
    while local_session.get(Coupon, serial_num) or serial_num == "0000000000":
        serial_num = generate_serial()
    # 0000000000 is reserved for testing

    insert_coupon = insert(Coupon).values(  # type: ignore
        serial_number=serial_num, prize_id=prize.id
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

    recently_issued_coupons[serial_num] = username

    return {"serial_number": serial_num}


@router.get("/{serial_num}", response_model=Coupon)
def get_coupon(
    *,
    staff_info: Annotated[dict, Depends(StaffBearer())],
    session: Annotated[Session, Depends(GetSession(local_engine))],
    serial_num: str,
):
    coupon = session.get(Coupon, serial_num)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.patch("/{serial_num}")
def use_coupon(
    *,
    staff_info: Annotated[dict, Depends(StaffBearer())],
    session: Annotated[Session, Depends(GetSession(local_engine))],
    serial_num: str,
):
    coupon = session.get(Coupon, serial_num)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.time_used is not None:
        raise HTTPException(status_code=409, detail="Coupon already used")
    coupon.time_used = datetime.now()
    session.add(coupon)
    session.commit()
    session.refresh(coupon)

    return Response(status_code=200)


@router.delete("/{serial_num}")
def delete_coupon(
    *,
    client_info: Annotated[dict, Depends(JWTBearer())],
    client_session: Annotated[Session, Depends(GetSession(client_engine))],
    local_session: Annotated[Session, Depends(GetSession(local_engine))],
    serial_num: str,
):
    coupon = local_session.get(Coupon, serial_num)
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    if coupon.time_used is not None:
        raise HTTPException(status_code=409, detail="Coupon already used")

    role = client_info.get("sub")
    username = client_info["name"]
    is_man = role not in ["manager", "exchange"]
    is_client = role is None or role == "client"
    if (is_client and recently_issued_coupons.get(serial_num) != username) or is_man:
        raise HTTPException(status_code=409, detail="Authorization error")

    prize = local_session.get(Prize, coupon.prize_id)
    assert prize is not None
    local_session.delete(coupon)
    upstmt = (
        update(Client)  # type: ignore
        .values(ticket_num=Client.ticket_num + prize.price)
        .where(Client.username == username)
    )
    client_session.exec(upstmt)  # type: ignore
    client_session.commit()

    local_session.delete(coupon)
    local_session.commit()

    return Response(status_code=200)
