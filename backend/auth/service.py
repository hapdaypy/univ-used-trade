from fastapi import HTTPException

from .model import User, UserCreate, Wallet
from ..database.core import DBSession


def create_user(db: DBSession, user_create: UserCreate) -> User:
    user = User(nickname=user_create.nickname, password=user_create.password)
    db.add(user)
    db.flush() 

    wallet = Wallet(user_id=user.id)
    db.add(wallet)

    db.commit()  # user + wallet are committed together
    db.refresh(user)
    return user
