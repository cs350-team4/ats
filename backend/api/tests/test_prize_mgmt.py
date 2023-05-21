from fastapi.testclient import TestClient
from sqlmodel import create_engine

from ..db.engine import local_engine
from ..dependencies import GetSession
from ..main import app
from ..models import OwnedModel
from ..settings import settings
from .utils.auth import generate_manager_token
from .utils.prize import (
    create_prize,
    delete_prize,
    get_all_prizes,
    get_one_prize,
    update_prize,
)

assert settings.TEST_DB_URI is not None

test_engine = create_engine(settings.TEST_DB_URI)

OwnedModel.metadata.create_all(test_engine)

app.dependency_overrides[GetSession(local_engine)] = GetSession(test_engine)

client = TestClient(app)

manager_tok = generate_manager_token(settings.PRIVATE_KEY, "man1")


def test_create_get_prize():
    prize = create_prize(client, manager_tok)

    prize_id = prize.id

    prize2 = get_one_prize(client, prize_id)
    assert prize2 == prize


def test_update_delete_prize():
    created_prize = create_prize(client, manager_tok)

    updated_prize = update_prize(
        client, manager_tok, created_prize.id, name="Updated Name"
    )
    assert updated_prize.name == "Updated Name"

    deleted_prize = delete_prize(client, manager_tok, updated_prize.id)
    assert deleted_prize == updated_prize

    # Ensure the prize is deleted
    prizes = get_all_prizes(client)
    assert deleted_prize not in prizes
