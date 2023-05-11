from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from ..main import app, get_session
from ..settings import settings
from .utils import random_32b_string, random_float

assert settings.TEST_DB_URI is not None

engine = create_engine(settings.TEST_DB_URI)

SQLModel.metadata.create_all(engine)


def override_get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:  # type: ignore
        yield session


app.dependency_overrides[get_session] = override_get_session

client = TestClient(app)


def test_create_get_game():
    pwd = random_32b_string()
    name = random_32b_string()
    ex_rate = random_float()
    response = client.post(
        "/games/", json={"name": name, "exchange_rate": ex_rate, "password": pwd}
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["name"] == name
    assert data["exchange_rate"] == ex_rate
    assert data["password"] == pwd
    assert "id" in data

    game_id = data["id"]

    response = client.get(f"/games/{game_id}")
    assert response.status_code == 200, response.text
    data = response.json()

    assert data["name"] == name
    assert data["exchange_rate"] == ex_rate
    assert data["password"] == pwd
