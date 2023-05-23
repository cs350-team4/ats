from ..settings import settings
from .utils.auth import generate_token, generate_token_invalid, public_key
from .utils.mock import client

assert settings.CLIENT_DB_URI is not None
assert settings.PUBLIC_KEY is not None
assert settings.PRIVATE_KEY is not None


def test_auth():
    public_key(client)

    generate_token(client, "aziz", "password")
    generate_token(client, "murad", "1")
    generate_token(client, "jirawut", "jwt")

    generate_token_invalid(client, "aziz", "1")
    generate_token_invalid(client, "murad", "password")
    generate_token_invalid(client, "jirawut", "' OR 1=1; --'")
