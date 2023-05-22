import random
import string

import jwt

from api.settings import settings


def decode_jwt(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.PUBLIC_KEY, algorithms=["ES256"])
    except jwt.PyJWTError:
        return None


OP_TABLE = (
    (0, 3, 1, 7, 5, 9, 8, 6, 4, 2),
    (7, 0, 9, 2, 1, 5, 4, 8, 6, 3),
    (4, 2, 0, 6, 8, 7, 1, 3, 5, 9),
    (1, 7, 5, 0, 9, 8, 3, 4, 2, 6),
    (6, 1, 2, 3, 0, 4, 5, 9, 7, 8),
    (3, 6, 7, 4, 2, 0, 9, 5, 8, 1),
    (5, 8, 6, 9, 7, 2, 0, 1, 3, 4),
    (8, 9, 4, 5, 3, 6, 2, 0, 1, 7),
    (9, 4, 3, 8, 6, 1, 7, 2, 0, 5),
    (2, 5, 8, 1, 4, 3, 6, 7, 9, 0),
)


def checksum(number: str) -> int:
    i = 0
    for n in number:
        i = OP_TABLE[i][int(n)]
    return i


def verify_serial(number: str) -> bool:
    return checksum(number) == 0


# TODO: Random seed
def generate_serial() -> str:
    val = "".join(random.choices(string.digits, k=9))
    return val + str(checksum(val))
