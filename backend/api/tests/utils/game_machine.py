from fastapi.testclient import TestClient


def start_game(
    client: TestClient, game_id: int, password: str, client_token: str
) -> int:
    print(password, game_id, client_token)
    response = client.post(
        "/games/start",
        json={"game_id": game_id, "password": password, "client_token": client_token},
    )
    return response.status_code


def end_game(
    client: TestClient, game_id: int, password: str, client_token: str, score: int = 0
) -> int:
    response = client.post(
        "/games/end",
        json={
            "game_id": game_id,
            "password": password,
            "client_token": client_token,
            "score": score,
        },
    )
    return response.status_code


def reset_game(client: TestClient, game_id: int, password: str) -> int:
    response = client.post(
        "/games/reset", json={"game_id": game_id, "password": password}
    )
    return response.status_code
