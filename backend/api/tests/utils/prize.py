import base64

from fastapi.testclient import TestClient
from pydantic import parse_obj_as

from api.models import PrizeRead


def get_all_prizes(client: TestClient) -> list[PrizeRead]:
    response = client.get("/prizes/")
    assert response.status_code == 200, response.text
    data = response.json()

    return parse_obj_as(list[PrizeRead], data)


def get_one_prize(client: TestClient, prize_id: int) -> PrizeRead:
    response = client.get(f"/prizes/{prize_id}")
    assert response.status_code == 200, response.text
    data = response.json()

    return PrizeRead.parse_obj(data)


def create_prize(
    client: TestClient,
    manager_tok: str,
    name: str = "prof's glasses",
    stock: int = 2,
    price: int = 50,
    description: str = "nice glasses",
    image: str = "./data/shin.png",
) -> PrizeRead:
    with open(image, "rb") as f:
        cont = f.read()
    encoded_img = base64.b64encode(cont).decode("utf-8")
    response = client.post(
        "/prizes/",
        json={
            "name": name,
            "stock": stock,
            "price": price,
            "description": description,
            "image": encoded_img,
        },
        headers={"Authorization": f"Bearer {manager_tok}"},
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["name"] == name
    assert data["stock"] == stock
    assert data["price"] == price
    assert data["description"] == description
    assert data["image"] == encoded_img
    assert "id" in data
    return PrizeRead.parse_obj(data)


def delete_prize(client: TestClient, manager_token: str, prize_id: int) -> PrizeRead:
    response = client.delete(
        f"/prizes/{prize_id}",
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert response.status_code == 200, response.text

    data = response.json()

    return PrizeRead.parse_obj(data)


def update_prize(
    client: TestClient,
    manager_token: str,
    prize_id: int,
    name: str | None = None,
    stock: int | None = None,
    price: int | None = None,
    description: str | None = None,
    image: str | None = None,
) -> PrizeRead:
    if image is not None:
        with open(image, "rb") as f:
            cont = f.read()
        image = base64.b64encode(cont).decode("utf-8")

    req_keys = ["name", "stock", "price", "description", "image"]
    req_vals = [name, stock, price, description, image]
    req_payload = {k: v for k, v in zip(req_keys, req_vals) if v is not None}
    response = client.patch(
        f"/prizes/{prize_id}",
        json=req_payload,
        headers={"Authorization": f"Bearer {manager_token}"},
    )
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["id"] == prize_id
    return PrizeRead.parse_obj(data)
