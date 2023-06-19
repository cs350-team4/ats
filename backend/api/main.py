from datetime import datetime, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from api.db.engine import client_engine, local_engine
from api.dependencies import GetSession
from api.logs import LoggingMiddleware, SecurityLog
from api.models import Client, GenerateToken, OwnedModel
from api.routers.coupon import router as coupon_router
from api.routers.game import router as game_router
from api.routers.logs import router as logs_router
from api.routers.prize import router as prize_router
from api.routers.user import router as user_router
from api.settings import settings


def create_db_and_tables() -> None:
    OwnedModel.metadata.create_all(local_engine)


origins = ["http://localhost:6006", "http://localhost:3000"]

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


assert isinstance(game_router, APIRouter)
app.include_router(game_router, prefix="/games")
app.include_router(prize_router, prefix="/prizes")
app.include_router(coupon_router, prefix="/coupon")
app.include_router(user_router, prefix="/user")
app.include_router(logs_router, prefix="/logs")

@app.post("/auth/generateToken", tags=["auth"])
def generate_token(
    *, session: Session = Depends(GetSession(client_engine)), payload: GenerateToken
):
    stmt = select(Client).where(Client.username == payload.username)
    result = session.exec(stmt).first()
    if result is None:
        SecurityLog.warning(f"[{payload.username}] tried to login as non-existent user")
        raise HTTPException(status_code=403, detail="Authentication failed")
    if bcrypt.checkpw(payload.password.encode("utf8"), result.password.encode("utf8")):
        jwToken = jwt.encode(
            {"name": result.username, "iat": datetime.now(tz=timezone.utc)},
            settings.PRIVATE_KEY,
            algorithm="ES256",
        )
        SecurityLog.info(f"[{result.username}] generated JWT successfully")
        return {"auth_token": jwToken}
    else:
        SecurityLog.warning(f"[{result.username}] used wrong password")
        raise HTTPException(status_code=403, detail="Authentication failed")


@app.get("/auth/publicKey", tags=["auth"])
def public_key():
    return {"publicKey": settings.PUBLIC_KEY}


app.mount("/", StaticFiles(directory="../frontend/dist", html=True))
