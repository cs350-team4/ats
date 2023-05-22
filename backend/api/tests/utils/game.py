from typing import Optional

from fastapi.testclient import TestClient
from httpx import Response

from api.models import GameRead

from . import random_32b_string, random_float


def create_game(
    client: TestClient, manager_tok: str, name: str, pwd: str, ex_rate: float
) -> Response:
    return client.post(
        "/games/",
        json={"name": name, "exchange_rate": ex_rate, "password": pwd},
        headers={"Authorization": f"Bearer {manager_tok}"},
    )


def update_game(
    client: TestClient,
    manager_tok: str,
    game_id: int,
    new_name: str,
    new_pwd: Optional[str] = None,
    new_ex_rate: Optional[float] = None,
) -> Response:
    payload = {"name": new_name, "password": new_pwd, "exchange_rate": new_ex_rate}
    if not new_pwd:
        payload.pop("password")
    if not new_ex_rate:
        payload.pop("exchange_rate")
    return client.patch(
        f"/games/{game_id}",
        json=payload,
        headers={"Authorization": f"Bearer {manager_tok}"},
    )


def get_one_game(client: TestClient, manager_tok: str, game_id: int) -> Response:
    return client.get(
        f"/games/{game_id}", headers={"Authorization": f"Bearer {manager_tok}"}
    )


def create_game_valid(
    client: TestClient, manager_tok: str, name: str, pwd: str, ex_rate: float
) -> GameRead:
    response = create_game(client, manager_tok, name, pwd, ex_rate)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["name"] == name
    assert data["exchange_rate"] == ex_rate
    assert data["password"] == pwd
    assert "id" in data

    return GameRead.parse_obj(data)


def create_game_invalid(
    client: TestClient, manager_tok: str, name: str, pwd: str, ex_rate: float
) -> int:
    response = create_game(client, manager_tok, name, pwd, ex_rate)
    return response.status_code


def update_game_valid(
    client: TestClient,
    manager_tok: str,
    game_id: int,
    new_name: str,
    new_pwd: Optional[str] = None,
    new_ex_rate: Optional[float] = None,
) -> GameRead:
    response = update_game(client, manager_tok, game_id, new_name, new_pwd, new_ex_rate)
    assert response.status_code == 200, response.text

    data = response.json()
    if new_name:
        assert data["name"] == new_name
    if new_ex_rate:
        assert data["exchange_rate"] == new_ex_rate
    if new_pwd:
        assert data["password"] == new_pwd
    assert data["id"] == game_id

    return GameRead.parse_obj(data)


def update_game_invalid(
    client: TestClient,
    manager_tok: str,
    game_id: int,
    new_name: str,
    new_pwd: Optional[str] = None,
    new_ex_rate: Optional[float] = None,
) -> int:
    response = update_game(client, manager_tok, game_id, new_name, new_pwd, new_ex_rate)
    return response.status_code


def get_one_game_valid(client: TestClient, manager_tok: str, game_id: int) -> GameRead:
    response = get_one_game(client, manager_tok, game_id)
    assert response.status_code == 200, response.text
    data = response.json()

    return GameRead.parse_obj(data)


def get_one_game_invalid(client: TestClient, manager_tok: str, game_id: int) -> int:
    response = get_one_game(client, manager_tok, game_id)
    return response.status_code


def delete_game_valid(client: TestClient, manager_tok: str, game_id: int) -> GameRead:
    response = client.delete(
        f"/games/{game_id}", headers={"Authorization": f"Bearer {manager_tok}"}
    )
    assert response.status_code == 200, response.text
    data = response.json()

    return GameRead.parse_obj(data)


def get_all_games_valid(client: TestClient, manager_tok: str) -> list[GameRead]:
    response = client.get("/games/", headers={"Authorization": f"Bearer {manager_tok}"})
    assert response.status_code == 200, response.text
    data = response.json()

    return [GameRead.parse_obj(x) for x in data]


def create_random_game(client: TestClient, manager_tok: str) -> GameRead:
    name = random_32b_string()
    pwd = random_32b_string()
    ex_rate = random_float()

    return create_game_valid(client, manager_tok, name, pwd, ex_rate)


def update_game_random(client: TestClient, manager_tok: str, game_id: int) -> GameRead:
    new_pwd = random_32b_string()
    new_name = random_32b_string()
    new_ex_rate = random_float()
    return update_game_valid(
        client, manager_tok, game_id, new_name, new_pwd, new_ex_rate
    )
