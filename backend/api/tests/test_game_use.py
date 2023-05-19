from ..settings import settings
from .utils.auth import generate_manager_token, generate_token
from .utils.game import create_random_game
from .utils.game_machine import end_game, reset_game, start_game
from .utils.mock import client

manager_tok = generate_manager_token(settings.PRIVATE_KEY, "man1")
client_tok = generate_token(client)
client2_tok = generate_token(client, "murad", "1")
client_tok_invalid = "I.am.invalid_token"
game = create_random_game(client, manager_tok)


def test_game_use_standard():
    status_code = start_game(client, game.id, game.password, client_tok)
    assert status_code == 200

    status_code = end_game(client, game.id, game.password, client_tok)
    assert status_code == 200


def test_game_use_standard_reset():
    status_code = start_game(client, game.id, game.password, client2_tok)
    assert status_code == 200

    status_code = reset_game(client, game.id, game.password)
    assert status_code == 200

    # reset only 200! even if `active_game` is empty
    status_code = reset_game(client, game.id, game.password)
    assert status_code == 200

    status_code = start_game(client, game.id, game.password, client_tok)
    assert status_code == 200

    status_code = end_game(client, game.id, game.password, client_tok)
    assert status_code == 200


def test_game_use_invalid():
    status_code = start_game(client, game.id, game.password, client_tok_invalid)
    assert status_code == 400

    status_code = end_game(client, game.id, game.password, client_tok)
    assert status_code == 400

    status_code = start_game(client, game.id, game.password, client_tok)
    assert status_code == 200

    status_code = start_game(client, game.id, game.password, client2_tok)
    assert status_code == 409

    status_code = start_game(client, game.id, game.password, client_tok)
    assert status_code == 409

    status_code = end_game(
        client, game.id, "nononononononononononononononono", client_tok
    )
    assert status_code == 400

    status_code = end_game(
        client, 9999999, "nononononononononononononononono", client_tok
    )
    assert status_code == 400

    status_code = end_game(client, game.id, game.password, client2_tok)
    assert status_code == 409

    status_code = end_game(client, game.id, game.password, client_tok_invalid)
    assert status_code == 400

    status_code = reset_game(client, game.id, game.password)
    assert status_code == 200

    status_code = reset_game(client, 99999999, "nononononononononononononononono")
    assert status_code == 400
