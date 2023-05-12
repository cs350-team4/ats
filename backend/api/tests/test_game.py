from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from ..main import app, get_session
from ..settings import settings
from .utils import random_32b_string, random_float
from .utils.game import create_random_game, get_one_game, update_game, delete_game, get_all_games


assert settings.TEST_DB_URI is not None

engine = create_engine(settings.TEST_DB_URI)

SQLModel.metadata.create_all(engine)


def override_get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:  # type: ignore
        yield session


app.dependency_overrides[get_session] = override_get_session

client = TestClient(app)


def test_create_get_game():
    game = create_random_game(client)

    game_id = game.id

    game2 = get_one_game(client, game_id)
    assert game2 == game
    # assert game2.name == game.name
    # assert game2.exchange_rate == game.exchange_rate
    # assert game2.password == game.password

def test_update_delete_list_game():
    game = create_random_game(client)
    new_game = update_game(client, game.id)
    assert new_game.name != game.name
    assert new_game.exchange_rate != game.exchange_rate
    assert new_game.exchange_rate != game.exchange_rate

    deleted_game = delete_game(client, game.id)
    assert deleted_game == new_game
    games = get_all_games(client)
    assert deleted_game not in games
