from sqlmodel import Field, Session, SQLModel, create_engine, select 


class User(SQLModel, table=True):
    __tablename__ = 'users'
    id: int | None = Field(default=None, primary_key=True)
    nickname: str = Field()
    password: str = Field()
