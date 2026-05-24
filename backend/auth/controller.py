from fastapi import APIRouter
from .model import User
from ..database.core import DBSession


router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.get("/")
def test_get(db:DBSession):
    return db.get(User, 1)