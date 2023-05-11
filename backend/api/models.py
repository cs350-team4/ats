from typing import Optional

from sqlmodel import Field, SQLModel


class GameBase(SQLModel):
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
