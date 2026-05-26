import os

from fastapi import Depends, FastAPI, Query
from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select 



postgres_url = os.environ["DATABASE_URL"]
engine = create_engine(postgres_url, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
    
DBSession = Annotated[Session, Depends(get_session)]
