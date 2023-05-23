import pytest

from ..settings import settings
from .utils.auth import generate_manager_token
from .utils.game import (
    create_game_invalid,
    create_game_valid,
    create_random_game,
    delete_game_valid,
    get_all_games_valid,
    get_one_game_invalid,
    get_one_game_valid,
    update_game_invalid,
    update_game_random,
    update_game_valid,
)
from .utils.mock import client

manager_tok = generate_manager_token(settings.PRIVATE_KEY, "man1")


def test_invalid_tok():
    with pytest.raises(AssertionError):
        create_random_game(client, "not_a jwt tok")


def test_create_get_game():
    game = create_random_game(client, manager_tok)

    game_id = game.id

    game2 = get_one_game_valid(client, manager_tok, game_id)
    assert game2 == game
    # assert game2.name == game.name
    # assert game2.exchange_rate == game.exchange_rate
    # assert game2.password == game.password


def test_update_delete_list_game():
    game = create_random_game(client, manager_tok)
    new_game = update_game_random(client, manager_tok, game.id)
    assert new_game.name != game.name
    assert new_game.exchange_rate != game.exchange_rate
    assert new_game.exchange_rate != game.exchange_rate

    deleted_game = delete_game_valid(client, manager_tok, game.id)
    assert deleted_game == new_game
    games = get_all_games_valid(client, manager_tok)
    assert deleted_game not in games


def test_create_game_invalid():
    assert 422 == create_game_invalid(client, manager_tok, "name", "test", 1)
    assert 422 == create_game_invalid(client, manager_tok, "name", "a" * 32, -1)
    assert 422 == create_game_invalid(client, manager_tok, "nam" * 100, "a" * 32, 1)
    assert 403 == create_game_invalid(client, "Invalid", "name", "a" * 32, 1)


def test_update_game_single_field():
    game = create_random_game(client, manager_tok)
    new_name = game.name[::-1]
    updated_game = update_game_valid(client, manager_tok, game.id, new_name)

    assert updated_game.name == new_name
    assert updated_game.exchange_rate == game.exchange_rate
    assert updated_game.password == game.password


def test_get_invalid_game():
    invalid_id = 9999
    assert 404 == get_one_game_invalid(client, manager_tok, invalid_id)


def test_update_invalid_game():
    invalid_id = 9999
    assert 404 == update_game_invalid(client, manager_tok, invalid_id, "New name")


def test_delete_invalid_game():
    invalid_id = 9999
    response = client.delete(
        f"/games/{invalid_id}", headers={"Authorization": f"Bearer {manager_tok}"}
    )
    assert response.status_code == 404


def test_create_game_no_auth():
    assert 403 == create_game_invalid(client, "", "name", "p" * 32, 1)


def test_update_game_no_auth():
    game = create_random_game(client, manager_tok)
    assert 403 == update_game_invalid(client, "", game.id, "New name")


def test_get_game_no_auth():
    game = create_random_game(client, manager_tok)
    response = client.get(f"/games/{game.id}", headers={"Authorization": ""})
    assert response.status_code == 403


def test_delete_game_no_auth():
    game = create_random_game(client, manager_tok)
    response = client.delete(f"/games/{game.id}", headers={"Authorization": ""})
    assert response.status_code == 403


@pytest.mark.skip(reason="Not an issue according to SRS")
def test_create_game_duplicate_name():
    game_name = "new_game_name_space_game"
    create_game_valid(client, manager_tok, game_name, "p" * 32, 1)
    assert 422 == create_game_invalid(client, manager_tok, game_name, "p" * 32, 2)
