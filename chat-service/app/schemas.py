from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime

class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[Any] = None
    message: str = "요청 성공"

class ChatRoomCreate(BaseModel):
    posts_id: int = Field(..., description="연계된 중고거래 Post ID")
    buyer_id: int = Field(..., description="대화를 시작하는 Buyer ID")

class MessagePayload(BaseModel):
    chat_room_id: int
    sender_id: int
    content: str
    created_at: datetime = Field(default_factory=datetime.now)