from fastapi.testclient import TestClient
from sqlmodel import create_engine

from ...db.engine import client_engine, local_engine
from ...dependencies import GetSession
from ...main import app
from ...models import Client, ClientModel, OwnedModel
from ...settings import settings

assert settings.TEST_DB_URI is not None
assert settings.TEST_CLIENT_DB_URI is not None

test_engine = create_engine(settings.TEST_DB_URI)
test_client_engine = create_engine(settings.TEST_CLIENT_DB_URI)

OwnedModel.metadata.create_all(test_engine)
ClientModel.metadata.create_all(test_client_engine)

app.dependency_overrides[GetSession(local_engine)] = GetSession(test_engine)
app.dependency_overrides[GetSession(client_engine)] = GetSession(test_client_engine)

client = TestClient(app)


def get_client(id: str) -> Client | None:
    return next(GetSession(test_client_engine)()).get(Client, id)
