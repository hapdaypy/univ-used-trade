from sqlmodel import Field, Session, SQLModel, create_engine, select
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    nickname: str | None = None


class User(SQLModel, table=True):
    __tablename__ = 'users'
    id: int | None = Field(default=None, primary_key=True)
    nickname: str = Field()
    password: str = Field()


class Wallet(SQLModel, table=True):
    __tablename__ = 'wallet'
    id: int | None = Field(default=None, primary_key=True)
    money: int = Field(default=0)
    user_id: int | None = Field(default=None, foreign_key="users.id")


class UserCreate(SQLModel):
    nickname: str
    password: str


class UserPublic(SQLModel):
    id: int
    nickname: str


class Token(BaseModel):
    access_token: str
    token_type: str
