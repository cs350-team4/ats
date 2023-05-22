import random

from api.utils import generate_serial, verify_serial

SHUFFLE = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]


def unit_serial_checksum_flip(i=9):
    serial_num = generate_serial()
    assert verify_serial(serial_num)

    serial_num = serial_num[:i] + SHUFFLE[int(serial_num[i])] + serial_num[i + 1 :]
    assert serial_num[i] == SHUFFLE[int(serial_num[i])] or not verify_serial(serial_num)


def unit_serial_checksum_swap(i=0):
    serial_num = generate_serial()
    assert verify_serial(serial_num)

    serial_num = (
        serial_num[:i] + serial_num[i + 1] + serial_num[i] + serial_num[i + 2 :]
    )
    assert serial_num[i] == serial_num[i + 1] or not verify_serial(serial_num)


def test_serial_checksum_flip():
    random.shuffle(SHUFFLE)
    for i in range(1000):
        unit_serial_checksum_flip(i % 10)


def test_serial_checksum_swap():
    for i in range(1000):
        unit_serial_checksum_swap(i % 9)
