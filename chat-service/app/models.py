from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True) # user_id -> id
    nickname = Column(String(255), unique=True, nullable=False) # username -> nickname
    password = Column(String(255), nullable=False)

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True) # post_id -> id
    seller_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False) # description -> content
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    posts_id = Column(Integer, nullable=False)
    buyer_id = Column(Integer, nullable=False)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_room_id = Column(Integer, nullable=False)
    sender_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())