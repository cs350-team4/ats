import pytest

from ..settings import settings
from .utils.auth import generate_manager_token
from .utils.game import (
    create_random_game,
    delete_game,
    get_all_games,
    get_one_game,
    update_game,
)
from .utils.mock import client

manager_tok = generate_manager_token(settings.PRIVATE_KEY, "man1")


def test_invalid_tok():
    with pytest.raises(AssertionError):
        create_random_game(client, "not_a jwt tok")


def test_create_get_game():
    game = create_random_game(client, manager_tok)

    game_id = game.id

    game2 = get_one_game(client, game_id, manager_tok)
    assert game2 == game
    # assert game2.name == game.name
    # assert game2.exchange_rate == game.exchange_rate
    # assert game2.password == game.password


def test_update_delete_list_game():
    game = create_random_game(client, manager_tok)
    new_game = update_game(client, game.id, manager_tok)
    assert new_game.name != game.name
    assert new_game.exchange_rate != game.exchange_rate
    assert new_game.exchange_rate != game.exchange_rate

    deleted_game = delete_game(client, game.id, manager_tok)
    assert deleted_game == new_game
    games = get_all_games(client, manager_tok)
    assert deleted_game not in games
