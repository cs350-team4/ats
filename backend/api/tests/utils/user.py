from fastapi.testclient import TestClient
from httpx import Response

from api.models import TicketsResponse


def get_tickets(client: TestClient, tok: str) -> Response:
    return client.get(
        "/user/tickets/",
        headers={"Authorization": f"Bearer {tok}"},
    )


def get_tickets_valid(client: TestClient, tok: str) -> TicketsResponse:
    response = get_tickets(client, tok)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["tickets"]
    assert data["tickets"] >= 0
    return TicketsResponse.parse_obj(data)


def get_tickets_invalid(client: TestClient, tok: str) -> int:
    response = get_tickets(client, tok)
    return response.status_code
