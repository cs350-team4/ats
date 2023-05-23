from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from api.db.engine import client_engine
from api.dependencies import GetSession, JWTBearer
from api.models import Client, TicketsResponse

router: APIRouter = APIRouter(tags=["user"])


@router.get("/tickets", response_model=TicketsResponse)
def get_tickets(
    *,
    client_info: Annotated[dict, Depends(JWTBearer())],
    client_session: Annotated[Session, Depends(GetSession(client_engine))]
):
    username = client_info["name"]
    stmt = select(Client.ticket_num).where(Client.username == username)
    ticket_num = client_session.exec(stmt).one()
    return {"tickets": ticket_num}
