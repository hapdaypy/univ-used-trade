from fastapi import HTTPException, status
from sqlmodel import select

from posts.model import ALLOWED_TRADE_LOCATIONS, Post, PostCreate
from database.core import DBSession


def create_post(db: DBSession, post_create: PostCreate, seller_id: int) -> Post:
    if post_create.trade_location not in ALLOWED_TRADE_LOCATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 교내 교환 장소입니다.",
        )

    post = Post(
        seller_id=seller_id,
        title=post_create.title,
        content=post_create.content,
        price=post_create.price,
        trade_location=post_create.trade_location,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_posts(db: DBSession) -> list[Post]:
    return db.exec(select(Post)).all()


def get_post(db: DBSession, post_id: int) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found",
        )
    return post
