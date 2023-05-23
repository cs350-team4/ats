import pytest

from .utils.auth import generate_manager_token, generate_staff_token, generate_token
from .utils.coupon import (
    delete_coupon_invalid,
    delete_coupon_valid,
    issue_coupon_invalid,
    issue_coupon_valid,
    use_coupon_invalid,
    use_coupon_valid,
    verify_coupon_invalid,
    verify_coupon_valid,
)
from .utils.mock import client
from .utils.prize import create_prize
from .utils.utils import seconds_since

# user should have around 1000000 tickets
client_tok = generate_token(client)
client2_tok = generate_token(client, username="murad", password="1")
staff_tok = generate_staff_token()
manager_tok = generate_manager_token()
invalid_tok = "Not.A.token"

prize = create_prize(client, manager_tok, price=1)
prize_expensive = create_prize(client, manager_tok, price=1000000000)

prize_nostock = create_prize(client, manager_tok, stock=0)

valid_serial = "0000000000"

serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number


def test_issue_verify_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    print(serial_number)
    verified_coupon = verify_coupon_valid(client, staff_tok, serial_number)
    assert serial_number == verified_coupon.serial_number


def test_issue_no_tickets():
    assert 402 == issue_coupon_invalid(client, client_tok, prize_expensive.id)


def test_issue_no_stock():
    assert 409 == issue_coupon_invalid(client, client_tok, prize_nostock.id)


def test_issue_prize_not_exist():
    assert 404 == issue_coupon_invalid(client, client_tok, 999999)


def test_unauthorized_issue_coupon():
    assert 403 == issue_coupon_invalid(client, invalid_tok, prize.id)


def test_verify_invalid_serial():
    assert 404 == verify_coupon_invalid(client, staff_tok, "999999999")


def test_verify_invalid_coupon():
    assert 404 == verify_coupon_invalid(client, staff_tok, valid_serial)


def test_client_verify_coupon():
    assert 403 == verify_coupon_invalid(client, client_tok, serial_number)


def test_unauthorized_verify_coupon():
    assert 403 == verify_coupon_invalid(client, invalid_tok, serial_number)


def test_use_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    use_coupon_valid(client, staff_tok, serial_number)


def test_use_verify_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    use_coupon_valid(client, staff_tok, serial_number)
    coupon = verify_coupon_valid(client, staff_tok, serial_number)
    assert seconds_since(coupon.time_used) < 5


def test_reuse_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    use_coupon_valid(client, staff_tok, serial_number)
    assert 409 == use_coupon_invalid(client, staff_tok, serial_number)


def test_use_invalid_serial():
    assert 404 == use_coupon_invalid(client, staff_tok, "999999999")


def test_use_invalid_coupon():
    assert 404 == use_coupon_invalid(client, staff_tok, valid_serial)


def test_client_use_coupon():
    assert 403 == use_coupon_invalid(client, client_tok, valid_serial)


def test_unauthorized_use_coupon():
    assert 403 == use_coupon_invalid(client, invalid_tok, valid_serial)


def test_delete_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    delete_coupon_valid(client, staff_tok, serial_number)


def test_delete_verify_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    delete_coupon_valid(client, staff_tok, serial_number)
    assert 404 == verify_coupon_invalid(client, staff_tok, serial_number)


def test_redelete_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    delete_coupon_valid(client, staff_tok, serial_number)
    assert 404 == delete_coupon_invalid(client, staff_tok, serial_number)


def test_delete_invalid_serial():
    assert 404 == delete_coupon_invalid(client, staff_tok, "999999999")


def test_delete_invalid_coupon():
    assert 404 == delete_coupon_invalid(client, staff_tok, valid_serial)


@pytest.mark.skip(reason="TODO: Not implemented")
def test_client2_delete_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    assert 409 == delete_coupon_invalid(client, client2_tok, serial_number)


def test_unauthorized_delete_coupon():
    assert 403 == delete_coupon_invalid(client, invalid_tok, valid_serial)


def test_use_delete_coupon():
    serial_number = issue_coupon_valid(client, client_tok, prize.id).serial_number
    use_coupon_valid(client, staff_tok, serial_number)
    verified_coupon_after_use = verify_coupon_valid(client, staff_tok, serial_number)
    assert verified_coupon_after_use.time_used is not None

    assert 409 == delete_coupon_invalid(client, client_tok, serial_number)
