import base64
import random
import string
from datetime import datetime


def random_32b_string() -> str:
    return "".join(random.choices(string.printable, k=32))


def random_float() -> float:
    return round(random.uniform(0, 2), 2)


def seconds_since(date: datetime) -> float:
    return (datetime.now() - date).total_seconds()


def load_image(image: str) -> str:
    with open(image, "rb") as f:
        cont = f.read()
    return base64.b64encode(cont).decode("utf-8")
