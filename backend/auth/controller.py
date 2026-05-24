from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

from typing import Annotated
from . import service
from .model import User, UserCreate, UserPublic
from ..database.core import DBSession


router = APIRouter(
    prefix='/auth',
    tags=['auth']
)


@router.get("/")
def test_get(db: DBSession):
    return db.get(User, 1)


@router.post("/users", response_model=UserPublic, status_code=201)
def create_user(user_create: UserCreate, db: DBSession):
    return service.create_user(db, user_create)
