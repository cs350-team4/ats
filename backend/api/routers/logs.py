import os
from typing import Annotated

from fastapi import APIRouter, Depends

from api.dependencies import ManagerBearer

router: APIRouter = APIRouter(tags=["logs"])


def read_logs(filename: str, lines: int) -> list[str]:
    _buffer: int = 4096
    lines_found: list[str] = []
    block_counter: int = -1
    with open(filename, "r") as f:
        while len(lines_found) < lines:
            try:
                f.seek(block_counter * _buffer, os.SEEK_END)
            except IOError:
                f.seek(0)
                lines_found = f.readlines()
                break

            lines_found = f.readlines()
            block_counter -= 1

    return lines_found[-lines:]


@router.get("/http")
def http_logs(*, _manager: Annotated[dict, Depends(ManagerBearer())], limit: int = 50):
    return read_logs("./logs/http.log", limit)


@router.get("/transaction")
def transaction_logs(
    *, _manager: Annotated[dict, Depends(ManagerBearer())], limit: int = 50
):
    return read_logs("./logs/transaction.log", limit)


@router.get("/security")
def security_logs(
    *, _manager: Annotated[dict, Depends(ManagerBearer())], limit: int = 50
):
    return read_logs("./logs/security.log", limit)
