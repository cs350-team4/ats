from api.utils import generate_serial, verify_serial

SHUFFLE = ["9", "3", "5", "4", "8", "7", "1", "6", "2", "0"]


def unit_serial_checksum_flip(i=9):
    serial_num = generate_serial()
    assert verify_serial(serial_num)

    serial_num = serial_num[:i] + SHUFFLE[int(serial_num[i])] + serial_num[i + 1 :]
    assert not verify_serial(serial_num)


def test_serial_checksum():
    for i in range(10):
        unit_serial_checksum_flip(i)
