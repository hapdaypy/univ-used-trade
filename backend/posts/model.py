from datetime import datetime

from sqlmodel import Field, SQLModel

ALLOWED_TRADE_LOCATIONS = [
    "학술정보원",
    "영실관",
    "충무관",
    "대양센터",
    "대양홀",
    "헹복기숙사",
    "군자관",
    "집현관",
    "용덕관",
    "이당관",
    "광개토관",
]


class Post(SQLModel, table=True):
    __tablename__ = 'posts'
    id: int | None = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="users.id")
    title: str = Field()
    content: str | None = Field(default=None)
    price: int = Field()
    trade_location: str = Field()
    status: str = Field(default="available")  # available / sold
    created_at: datetime = Field(default_factory=datetime.now)


class PostCreate(SQLModel):
    title: str
    content: str | None = None
    price: int
    trade_location: str


class PostPublic(SQLModel):
    id: int
    seller_id: int
    title: str
    content: str | None
    price: int
    trade_location: str
    status: str
    created_at: datetime
