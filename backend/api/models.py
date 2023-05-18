from datetime import datetime
from typing import Optional

from sqlalchemy.orm import registry  # type: ignore
from sqlmodel import Field, SQLModel


class OwnedModel(SQLModel, registry=registry()):
    pass


class GameBase(OwnedModel):
    name: str = Field(max_length=255, nullable=False)
    exchange_rate: float = Field(nullable=False)
    password: str = Field(min_length=32, max_length=32, nullable=False)


class Game(GameBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class GameCreate(GameBase):
    pass


class GameRead(GameBase):
    id: int


class GameUpdate(SQLModel):
    name: Optional[str] = None
    exchange_rate: Optional[float] = None
    password: Optional[str] = Field(min_length=32, max_length=32)


class ClientBase(SQLModel):
    username: str = Field(max_length=255, nullable=False, unique=True)
    password: str = Field(min_length=60, max_length=60, nullable=False)


class GenerateToken(ClientBase):
    expire: datetime | None
    password: str = Field(nullable=False)


class Client(ClientBase, table=True):
    id: str = Field(primary_key=True)
    ticket_num: int = Field(nullable=False, default=0)
