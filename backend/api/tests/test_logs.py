from .utils.auth import generate_manager_token, generate_staff_token, generate_token
from .utils.logs import get_http_logs, get_security_logs, get_transaction_logs
from .utils.mock import client

client_tok = generate_token(client)
staff_tok = generate_staff_token()
manager_tok = generate_manager_token()


def test_http_logs():
    assert 200 == get_http_logs(client, manager_tok).status_code
    assert 403 == get_http_logs(client, staff_tok).status_code
    assert 403 == get_http_logs(client, client_tok).status_code

    assert 200 == get_http_logs(client, manager_tok, limit=10000).status_code


def test_transaction_logs():
    assert 200 == get_transaction_logs(client, manager_tok).status_code
    assert 403 == get_transaction_logs(client, staff_tok).status_code
    assert 403 == get_transaction_logs(client, client_tok).status_code


def test_security_logs():
    assert 200 == get_security_logs(client, manager_tok).status_code
    assert 403 == get_security_logs(client, staff_tok).status_code
    assert 403 == get_security_logs(client, client_tok).status_code
