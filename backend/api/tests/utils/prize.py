from typing import Optional

from fastapi.testclient import TestClient
from httpx import Response
from pydantic import parse_obj_as

from api.models import PrizeRead

from .utils import load_image

base64_image = load_image("./data/prize.png")


def get_all_prizes(
    client: TestClient, start: Optional[int] = None, limit: Optional[int] = None
) -> Response:
    params = {}
    if start is not None:
        params["start"] = start
    if limit is not None:
        params["limit"] = limit
    return client.get("/prizes", params=params)


def get_one_prize(client: TestClient, prize_id: int) -> Response:
    return client.get(f"/prizes/{prize_id}")


def create_prize(
    client: TestClient,
    staff_tok: str,
    name: str,
    stock: int,
    price: int,
    description: str,
    encoded_image: str,
) -> Response:
    return client.post(
        "/prizes/",
        json={
            "name": name,
            "stock": stock,
            "price": price,
            "description": description,
            "image": encoded_image,
        },
        headers={"Authorization": f"Bearer {staff_tok}"},
    )


def update_prize(
    client: TestClient,
    staff_tok: str,
    prize_id: int,
    name: Optional[str] = None,
    stock: Optional[int] = None,
    price: Optional[int] = None,
    description: Optional[str] = None,
    encoded_image: Optional[str] = None,
) -> Response:
    payload = {
        "name": name,
        "stock": stock,
        "price": price,
        "description": description,
        "image": encoded_image,
    }
    for k in list(payload):
        if payload[k] is None:
            payload.pop(k)
    return client.patch(
        f"/prizes/{prize_id}",
        json=payload,
        headers={"Authorization": f"Bearer {staff_tok}"},
    )


def delete_prize(client: TestClient, staff_token: str, prize_id: int) -> Response:
    return client.delete(
        f"/prizes/{prize_id}",
        headers={"Authorization": f"Bearer {staff_token}"},
    )


def get_all_prizes_valid(
    client: TestClient, start: Optional[int] = None, limit: Optional[int] = None
) -> list[PrizeRead]:
    response = get_all_prizes(client, start, limit)
    assert response.status_code == 200, response.text
    data = response.json()
    assert limit is None or len(data) <= limit
    return parse_obj_as(list[PrizeRead], data)


def get_all_prizes_invalid(
    client: TestClient, start: Optional[int] = None, limit: Optional[int] = None
) -> int:
    response = get_all_prizes(client, start, limit)
    return response.status_code


def get_one_prize_valid(client: TestClient, prize_id: int) -> PrizeRead:
    response = client.get(f"/prizes/{prize_id}")
    assert response.status_code == 200, response.text
    data = response.json()

    return PrizeRead.parse_obj(data)


def get_one_prize_invalid(client: TestClient, prize_id: int) -> int:
    response = client.get(f"/prizes/{prize_id}")
    return response.status_code


def create_prize_valid(
    client: TestClient,
    staff_tok: str,
    name: str = "Prize",
    stock: int = 2,
    price: int = 50,
    description: str = "Lorem ipsum dolores",
    encoded_image: str = base64_image,
) -> PrizeRead:
    response = create_prize(
        client, staff_tok, name, stock, price, description, encoded_image
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert "id" in data
    assert data["name"] == name
    assert data["stock"] == stock
    assert data["price"] == price
    assert data["description"] == description
    assert data["image"] == encoded_image
    assert "id" in data
    return PrizeRead.parse_obj(data)


def create_prize_invalid(
    client: TestClient,
    staff_tok: str,
    name: str = "Prize",
    stock: int = 2,
    price: int = 50,
    description: str = "Lorem ipsum dolores",
    encoded_image: str = base64_image,
) -> int:
    response = create_prize(
        client, staff_tok, name, stock, price, description, encoded_image
    )
    return response.status_code


def update_prize_valid(
    client: TestClient,
    staff_token: str,
    prize_id: int,
    name: str | None = None,
    stock: int | None = None,
    price: int | None = None,
    description: str | None = None,
    encoded_image: str | None = None,
) -> PrizeRead:
    response = update_prize(
        client, staff_token, prize_id, name, stock, price, description, encoded_image
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["id"] == prize_id
    return PrizeRead.parse_obj(data)


def update_prize_invalid(
    client: TestClient,
    staff_token: str,
    prize_id: int,
    name: str | None = None,
    stock: int | None = None,
    price: int | None = None,
    description: str | None = None,
    encoded_image: str | None = None,
) -> int:
    response = update_prize(
        client, staff_token, prize_id, name, stock, price, description, encoded_image
    )
    return response.status_code


def delete_prize_valid(
    client: TestClient, staff_token: str, prize_id: int
) -> PrizeRead:
    response = delete_prize(client, staff_token, prize_id)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["id"] == prize_id
    return PrizeRead.parse_obj(data)


def delete_prize_invalid(client: TestClient, staff_token: str, prize_id: int) -> int:
    response = delete_prize(client, staff_token, prize_id)
    return response.status_code
