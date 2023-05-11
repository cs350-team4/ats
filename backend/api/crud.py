from sqlmodel import Session, select

from . import models


def get_game(db: Session, game_id: int) -> models.Game | None:
    return db.get(models.Game, game_id)


def get_games(db: Session) -> list[models.Game]:
    return db.exec(select(models.Game)).all()


def update_game(
    db: Session, game_id: int, game: models.GameUpdate
) -> models.Game | None:
    db_game = db.get(models.Game, game_id)
    if not db_game:
        return None
    game_data = game.dict(exclude_unset=True)
    for key, value in game_data.items():
        setattr(db_game, key, value)
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


def create_game(db: Session, game: models.GameCreate) -> models.Game:
    db_game = models.Game.from_orm(game)
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


def delete_game(db: Session, game_id: int) -> models.Game | None:
    game = db.get(models.Game, game_id)
    if not game:
        return None
    db.delete(game)
    db.commit()
    return game
