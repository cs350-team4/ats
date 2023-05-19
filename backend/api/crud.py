import base64

from sqlmodel import Session, select

from . import models


def get_prizes(db: Session, skip: int, limit: int) -> list[models.Prize]:
    stmt = select(models.Prize).offset(skip).limit(limit)
    return db.exec(stmt).all()


def get_prize(db: Session, prize_id: int) -> models.Prize | None:
    return db.get(models.Prize, prize_id)


def create_prize(db: Session, prize: models.PrizeCreate) -> models.Prize:
    prize.image = base64.b64decode(prize.image)
    db_prize = models.Prize.from_orm(prize)
    db.add(db_prize)
    db.commit()
    db.refresh(db_prize)
    return db_prize


def update_prize(
    db: Session, prize_id: int, prize: models.PrizeUpdate
) -> models.Prize | None:
    db_prize = db.get(models.Prize, prize_id)
    if not db_prize:
        return None
    prize_data = prize.dict(exclude_unset=True)
    for key, value in prize_data.items():
        if key == "image":
            value = base64.b64decode(value)
        setattr(db_prize, key, value)
    db.add(db_prize)
    db.commit()
    db.refresh(db_prize)
    return db_prize


def delete_prize(db: Session, prize_id: int) -> models.Prize | None:
    prize = db.get(models.Prize, prize_id)
    if not prize:
        return None
    db.delete(prize)
    db.commit()
    return prize


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
