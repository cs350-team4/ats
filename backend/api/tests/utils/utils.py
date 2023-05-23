import random
import string
from datetime import datetime


def random_32b_string() -> str:
    return "".join(random.choices(string.printable, k=32))


def random_float() -> float:
    return round(random.uniform(0, 2), 2)


def seconds_since(date: datetime) -> float:
    return (datetime.now() - date).total_seconds()
