from sqlmodel import create_engine

from api.settings import settings

assert settings.DATABASE_URI is not None
# pool_pre_ping -> test conn is viable at the start of each conn
local_engine = create_engine(settings.DATABASE_URI, echo=True, pool_pre_ping=True)

assert settings.CLIENT_DB_URI is not None
client_engine = create_engine(settings.CLIENT_DB_URI, echo=True, pool_pre_ping=True)
