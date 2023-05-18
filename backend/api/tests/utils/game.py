from fastapi.testclient import TestClient

from api.models import GameRead

from . import random_32b_string, random_float


def create_random_game(client: TestClient, manager_tok: str) -> GameRead:
    name = random_32b_string()
    pwd = random_32b_string()
    ex_rate = random_float()
    response = client.post(
        "/games/",
        json={"name": name, "exchange_rate": ex_rate, "password": pwd},
        headers={"Authorization": f"Bearer {manager_tok}"},
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["name"] == name
    assert data["exchange_rate"] == ex_rate
    assert data["password"] == pwd
    assert "id" in data

    return GameRead.parse_obj(data)


def update_game(client: TestClient, game_id: int, manager_tok: str) -> GameRead:
    new_pwd = random_32b_string()
    new_name = random_32b_string()
    new_ex_rate = random_float()
    response = client.patch(
        f"/games/{game_id}",
        json={"name": new_name, "exchange_rate": new_ex_rate, "password": new_pwd},
        headers={"Authorization": f"Bearer {manager_tok}"},
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["name"] == new_name
    assert data["exchange_rate"] == new_ex_rate
    assert data["password"] == new_pwd
    assert data["id"] == game_id

    return GameRead.parse_obj(data)


def get_one_game(client: TestClient, game_id: int, manager_tok: str) -> GameRead:
    response = client.get(
        f"/games/{game_id}", headers={"Authorization": f"Bearer {manager_tok}"}
    )
    assert response.status_code == 200, response.text
    data = response.json()

    return GameRead.parse_obj(data)


def delete_game(client: TestClient, game_id: int, manager_tok: str) -> GameRead:
    response = client.delete(
        f"/games/{game_id}", headers={"Authorization": f"Bearer {manager_tok}"}
    )
    assert response.status_code == 200, response.text
    data = response.json()

    return GameRead.parse_obj(data)


def get_all_games(client: TestClient, manager_tok: str) -> list[GameRead]:
    response = client.get("/games/", headers={"Authorization": f"Bearer {manager_tok}"})
    assert response.status_code == 200, response.text
    data = response.json()

    return [GameRead.parse_obj(x) for x in data]
