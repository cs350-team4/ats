from fastapi.testclient import TestClient
from httpx import Response

from api.models import Coupon, IssueCouponResponse, SerialNumType

from ...utils import verify_serial
from .utils import seconds_since

# API endpoint wrappers


def issue_coupon(client: TestClient, tok: str, prize_id: int) -> Response:
    return client.post(
        "/coupon/issue",
        json={"prize_id": prize_id},
        headers={"Authorization": f"Bearer {tok}"},
    )


def verify_coupon(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> Response:
    print(f"'/coupon/{serial_num}'")
    return client.get(
        f"/coupon/{serial_num}",
        headers={"Authorization": f"Bearer {staff_tok}"},
    )


def use_coupon(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> Response:
    return client.patch(
        f"/coupon/{serial_num}",
        headers={"Authorization": f"Bearer {staff_tok}"},
    )


def delete_coupon(client: TestClient, tok: str, serial_num: SerialNumType) -> Response:
    return client.delete(
        f"/coupon/{serial_num}",
        headers={"Authorization": f"Bearer {tok}"},
    )


# API endpoint wrappers valid verification wrappers
def issue_coupon_valid(
    client: TestClient, tok: str, prize_id: int
) -> IssueCouponResponse:
    response = issue_coupon(client, tok, prize_id)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["serial_number"]
    assert verify_serial(data["serial_number"])
    return IssueCouponResponse.parse_obj(data)


def verify_coupon_valid(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> Coupon:
    response = verify_coupon(client, staff_tok, serial_num)
    print(response.status_code)
    print(response.text)
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["serial_number"]
    assert data["prize_id"]

    assert verify_serial(data["serial_number"])
    coupon = Coupon.parse_obj(data)

    if coupon.time_used:
        assert 0 <= seconds_since(coupon.time_used)

    return coupon


def use_coupon_valid(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> None:
    response = use_coupon(client, staff_tok, serial_num)
    assert response.status_code == 200


def delete_coupon_valid(
    client: TestClient, tok: str, serial_num: SerialNumType
) -> None:
    response = delete_coupon(client, tok, serial_num)
    assert response.status_code == 200


# API endpoint wrappers invalid verification wrappers
def issue_coupon_invalid(client: TestClient, tok: str, prize_id: int) -> int:
    response = issue_coupon(client, tok, prize_id)
    return response.status_code


def verify_coupon_invalid(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> int:
    response = verify_coupon(client, staff_tok, serial_num)
    return response.status_code


def use_coupon_invalid(
    client: TestClient, staff_tok: str, serial_num: SerialNumType
) -> int:
    response = use_coupon(client, staff_tok, serial_num)
    return response.status_code


def delete_coupon_invalid(
    client: TestClient, tok: str, serial_num: SerialNumType
) -> int:
    response = delete_coupon(client, tok, serial_num)
    return response.status_code
