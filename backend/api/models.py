from datetime import datetime
from typing import Optional

from pydantic import BaseModel, conint, constr
from sqlalchemy.orm import registry  # type: ignore
from sqlmodel import Field, SQLModel


class OwnedModel(SQLModel, registry=registry()):
    pass


class GameBase(OwnedModel):
    name: str = Field(max_length=255, nullable=False)
    exchange_rate: float = Field(nullable=False)
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
    stock: int
    # TODO: change SDD output to price in API
    price: int
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


class ClientModel(SQLModel, registry=registry()):
    pass


class ClientBase(ClientModel):
    username: str = Field(max_length=255, nullable=False, unique=True)
    password: str = Field(min_length=60, max_length=60, nullable=False)


class GenerateToken(ClientBase):
    expire: datetime | None
    password: str = Field(nullable=False)


class Client(ClientBase, table=True):
    id: str = Field(primary_key=True)
    ticket_num: int = Field(nullable=False, default=0)
