from datetime import datetime
from sqlmodel import Field, SQLModel


class Transaction(SQLModel, table=True):
    __tablename__ = 'transactions'
    id: int | None = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="posts.id")
    buyer_id: int = Field(foreign_key="users.id")
    seller_id: int = Field(foreign_key="users.id")
    amount: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.now)


class PurchaseRequest(SQLModel):
    post_id: int


class ChargeRequest(SQLModel):
    amount: int


class TransactionPublic(SQLModel):
    id: int
    post_id: int
    buyer_id: int
    seller_id: int
    amount: int
    created_at: datetime


class WalletPublic(SQLModel):
    id: int
    user_id: int
    money: int