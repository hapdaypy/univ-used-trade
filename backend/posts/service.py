from fastapi import HTTPException, status
from sqlmodel import select

from posts.model import Post, PostCreate
from database.core import DBSession


def create_post(db: DBSession, post_create: PostCreate, seller_id: int) -> Post:
    post = Post(
        seller_id=seller_id,
        title=post_create.title,
        content=post_create.content,
        price=post_create.price,
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
