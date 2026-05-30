from typing import Annotated
from fastapi import HTTPException, Depends, status
import jwt

from sqlmodel import select
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta, timezone

from auth.model import User, UserCreate, Wallet, Token, TokenData
from database.core import DBSession

SECRET_KEY = "a728846600dbfb087e4ee943d7e96c487a80af853d5f260fd9bdf8986ea7329d"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def create_user(db: DBSession, user_create: UserCreate) -> User:
    user = User(nickname=user_create.nickname, password=user_create.password)
    db.add(user)
    db.flush()

    wallet = Wallet(user_id=user.id)
    db.add(wallet)

    db.commit()  # user + wallet are committed together
    db.refresh(user)
    return user


def authenticate_user(db: DBSession, nickname: str, password: str) -> User | bool:
    statement = select(User).where(
        User.nickname == nickname).where(User.password == password)
    user = db.exec(statement).all()

    print(user)
    print(type(user))

    if len(user) > 0:
        return user[0]
    else:
        return False


def getUser(db: DBSession, nickname: str) -> User | None:
    statement = select(User).where(User.nickname == nickname)
    user = db.exec(statement).all()

    if len(user) > 0:
        return user[0]
    else:
        return None


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: DBSession):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        nickname = payload.get("sub")
        if nickname is None:
            raise credentials_exception

        token_data = TokenData(nickname=nickname)
    except InvalidTokenError:
        raise credentials_exception

    user = getUser(db, token_data.nickname)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user
