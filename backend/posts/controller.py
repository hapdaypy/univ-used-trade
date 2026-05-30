from typing import Annotated

from fastapi import APIRouter, Depends

from posts import service
from posts.model import PostCreate, PostPublic
from auth.model import User
from auth.service import get_current_active_user
from database.core import DBSession


router = APIRouter(
    prefix='/posts',
    tags=['posts']
)


@router.post("", response_model=PostPublic, status_code=201)
def create_post(
    post_create: PostCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: DBSession,
):
    return service.create_post(db, post_create, current_user.id)


@router.get("", response_model=list[PostPublic])
def get_posts(db: DBSession):
    return service.get_posts(db)


@router.get("/{post_id}", response_model=PostPublic)
def get_post(post_id: int, db: DBSession):
    return service.get_post(db, post_id)
