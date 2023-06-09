from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel
from pydantic import Field as PydField
from pydantic import conint, constr
from sqlalchemy.orm import registry  # type: ignore
from sqlmodel import Field, SQLModel


class OwnedModel(SQLModel, registry=registry()):
    pass


class GameBase(OwnedModel):
    name: str = Field(max_length=255, nullable=False)
    exchange_rate: float = Field(ge=0, nullable=False)
    password: str = Field(min_length=32, max_length=32, nullable=False)


class Game(GameBase, table=True):
    id: int = Field(default=None, primary_key=True)


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: int


class GameUpdate(OwnedModel):
    name: Optional[str] = None
    exchange_rate: Optional[float] = None
    password: Optional[str] = Field(min_length=32, max_length=32)


class GameStateBase(BaseModel):
    game_id: int
    password: constr(min_length=32, max_length=32)  # type: ignore


class GameStateUserBase(GameStateBase):
    client_token: str


class GameStateStart(GameStateUserBase):
    pass


class GameStateEnd(GameStateUserBase):
    # score >= 0
    score: conint(ge=0)  # type: ignore


class GameStateReset(GameStateBase):
    pass


class PrizeBase(OwnedModel):
    name: str = Field(max_length=255)
    stock: conint(ge=0)  # type: ignore
    # TODO: change SDD output to price in API
    price: conint(ge=0)  # type: ignore
    description: str


class Prize(PrizeBase, table=True):
    image: bytes
    id: int = Field(default=None, primary_key=True)


class PrizeCreate(PrizeBase):
    image: str | bytes


class PrizeRead(PrizeBase):
    image: str
    id: int


class PrizeUpdate(OwnedModel):
    name: str | None = Field(max_length=255)
    stock: int | None
    price: int | None
    image: bytes | None
    description: str | None


class Coupon(OwnedModel, table=True):
    serial_number: str = Field(regex=r"^[0-9]{10}$", primary_key=True)
    time_used: datetime | None = Field(default=None, nullable=True)
    prize_id: int = Field(foreign_key="prize.id", nullable=False)


class ClientModel(SQLModel, registry=registry()):
    pass


class ClientBase(ClientModel):
    username: str = Field(max_length=255, nullable=False, unique=True)
    password: str = Field(min_length=60, max_length=60, nullable=False)


class GenerateToken(ClientBase):
    # expire: datetime | None #TODO
    password: str = Field(nullable=False)


class Client(ClientBase, table=True):
    id: str = Field(primary_key=True)
    ticket_num: int = Field(nullable=False, default=0)


class TicketsResponse(BaseModel):
    tickets: int


class IssueCouponPayload(BaseModel):
    prize_id: int


SerialNumType = Annotated[str, PydField(regex=r"^[0-9]{10}$")]


class IssueCouponResponse(BaseModel):
    serial_number: SerialNumType
