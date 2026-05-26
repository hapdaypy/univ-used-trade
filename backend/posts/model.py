from datetime import datetime

from sqlmodel import Field, SQLModel


class Post(SQLModel, table=True):
    __tablename__ = 'posts'
    id: int | None = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="users.id")
    title: str = Field()
    content: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)


class PostCreate(SQLModel):
    title: str
    content: str | None = None


class PostPublic(SQLModel):
    id: int
    seller_id: int
    title: str
    content: str | None
    created_at: datetime
