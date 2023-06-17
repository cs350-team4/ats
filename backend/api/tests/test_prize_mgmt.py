from sqlmodel import create_engine

from .utils.mock import client
from .utils.auth import generate_manager_token, generate_staff_token
from .utils.prize import (
    create_prize_valid,
    create_prize_invalid,
    delete_prize_valid,
    get_all_prizes_valid,
    get_one_prize_valid,
    get_one_prize_invalid,
    update_prize_invalid,
    update_prize_valid,
)

staff_tok = generate_staff_token()
manager_tok = generate_manager_token()


def test_create_get_prize():
    prize = create_prize_valid(client, manager_tok)

    prize_id = prize.id

    prize2 = get_one_prize_valid(client, prize_id)
    assert prize2 == prize


def test_update_delete_prize():
    created_prize = create_prize_valid(client, manager_tok)

    updated_prize = update_prize_valid(
        client, manager_tok, created_prize.id, name="Updated Name"
    )
    assert updated_prize.name == "Updated Name"

    deleted_prize = delete_prize_valid(client, manager_tok, updated_prize.id)
    assert deleted_prize == updated_prize

    # Ensure the prize is deleted
    prizes = get_all_prizes_valid(client)
    assert deleted_prize not in prizes

def test_get_prizes_with_start_limit():
    prizes = get_all_prizes_valid(client, start=0, limit=2)
    assert len(prizes) == 2

def test_get_single_prize():
    first_prize = get_all_prizes_valid(client, start=0, limit=1)
    assert len(first_prize) == 1
    first_prize = first_prize[0]

    second_prize = get_one_prize_valid(client, first_prize.id)
    assert first_prize == second_prize

def test_get_non_existent_prize():
    assert get_one_prize_invalid(client, 999999999) == 404

def test_create_invalid_prize():
    assert 422 == create_prize_invalid(client, staff_tok, name="Test", stock=-1, price=50, description="Test")
    assert 422 == create_prize_invalid(client, staff_tok, name="Test", stock=1, price=-50, description="Test")

def test_update_prize():
    prizes = get_all_prizes_valid(client, start=0, limit=1)
    assert len(prizes) == 1
    initial_prize = prizes[0]
    updated_prize = update_prize_valid(client, staff_tok, initial_prize.id, name="New name")
    assert updated_prize == get_one_prize_valid(client, initial_prize.id)
    initial_prize.name = "New name"
    assert initial_prize == updated_prize

def test_update_prize_no_change():
    prizes = get_all_prizes_valid(client, start=0, limit=1)
    assert len(prizes) == 1
    initial_prize = prizes[0]
    updated_prize = update_prize_valid(client, staff_tok, initial_prize.id)
    assert updated_prize == get_one_prize_valid(client, initial_prize.id)
    assert initial_prize == updated_prize

def test_update_non_existent_prize():
    assert 404 == update_prize_invalid(client, staff_tok, 999999999, name="new")

def test_create_malformed_base64():
    assert 422 == create_prize_invalid(client, staff_tok, encoded_image="this.@in't.base64")