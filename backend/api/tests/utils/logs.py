from typing import Optional
from fastapi.testclient import TestClient
from httpx import Response


def get_http_logs(client: TestClient, tok: str, limit: Optional[int] = None) -> Response:
    params = {}
    if limit is not None:
        params["limit"] = limit
    return client.get(
        "/logs/http",
        params=params,
        headers={"Authorization": f"Bearer {tok}"}
    )

def get_transaction_logs(client: TestClient, tok: str, limit: Optional[int] = None) -> Response:
    params = {}
    if limit is not None:
        params["limit"] = limit
    return client.get(
        "/logs/transaction",
        params=params,
        headers={"Authorization": f"Bearer {tok}"}
    )

def get_security_logs(client: TestClient, tok: str, limit: Optional[int] = None) -> Response:
    params = {}
    if limit is not None:
        params["limit"] = limit
    return client.get(
        "/logs/security",
        params=params,
        headers={"Authorization": f"Bearer {tok}"}
    )