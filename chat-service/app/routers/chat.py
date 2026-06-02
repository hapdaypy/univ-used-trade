# app/routers/chat.py
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.schemas import SuccessResponse, ChatRoomCreate, MessagePayload
from app.websocket import manager
from app import models

router = APIRouter(prefix="/api/chat", tags=["CampusChat"])

# [HTTP API] 1:1 채팅방 개설 창구
@router.post("/rooms", response_model=SuccessResponse)
async def create_chat_room(room_data: ChatRoomCreate, db: Session = Depends(get_db)):
    # 1. posts 테이블에서 게시글 정보 조회
    post = db.query(models.Post).filter(models.Post.id == room_data.posts_id).first()
    
    if not post:
        raise HTTPException(
            status_code=404,
            detail={"success": False, "error": {"code": "POST_NOT_FOUND", "message": "존재하지 않는 상품 게시글입니다."}}
        )
    
    # 구매자(buyer_id)가 실제 users 테이블에 있는지 확인합니다.
    buyer = db.query(models.User).filter(models.User.id == room_data.buyer_id).first()
    
    # 존재하지 않는 유저라면 404 에러를 발생시킵니다.
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="존재하지 않는 사용자(구매자)입니다."
        )
        
    # 2. Buyer ID가 Seller ID와 같은지 검증
    if room_data.buyer_id == post.seller_id:
        return SuccessResponse(
            success=False,
            message="채팅방 개설 실패",
            data={"error_code": "SELF_TRANSACTION_FORBIDDEN", "reason": "자신이 올린 판매글에서는 대화방을 만들 수 없습니다."}
        )

    # 3. 기존에 동일한 posts_id와 buyer_id로 이미 파놓은 방이 있는지 검색
    existing_room = db.query(models.ChatRoom).filter(
        models.ChatRoom.posts_id == room_data.posts_id,
        models.ChatRoom.buyer_id == room_data.buyer_id
    ).first()

    # 4. 이미 방이 존재한다면 기존 방 정보를 리턴하며 이동 처리
    if existing_room:
        return SuccessResponse(
            success=True,
            data={
                "room_id": existing_room.id,
                "posts_id": existing_room.posts_id,
                "buyer_id": existing_room.buyer_id,
                "seller_id": post.seller_id # 프론트엔드 편의를 위해 seller_id도 함께 전송
            },
            message="이미 개설된 대화방이 존재하므로 기존 채팅방으로 이동합니다."
        )

    # 5. 첫 개설이라면 새로운 대화방 행 생성 후 영구 저장
    new_room = models.ChatRoom(
        posts_id=room_data.posts_id,
        buyer_id=room_data.buyer_id
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return SuccessResponse(
        success=True,
        data={
            "room_id": new_room.id,
            "posts_id": new_room.posts_id,
            "buyer_id": new_room.buyer_id,
            "seller_id": post.seller_id
        },
        message="새로운 1:1 중고거래 채팅방이 성공적으로 개설되었습니다!"
    )

# [HTTP API] 참여 중인 채팅방 목록 모아보기
@router.get("/rooms/{user_id}", response_model=SuccessResponse)
async def get_user_chat_rooms(user_id: int, db: Session = Depends(get_db)):

    rooms = db.query(models.ChatRoom).join(
        models.Post, models.ChatRoom.posts_id == models.Post.id
    ).filter(
        (models.ChatRoom.buyer_id == user_id) | (models.Post.seller_id == user_id)
    ).all()
    
    user_rooms = []
    for r in rooms:
        # 조인된 해당 방의 원본 게시글을 다시 한 번 특정하여 판매자 ID 획득
        post = db.query(models.Post).filter(models.Post.id == r.posts_id).first()
        user_rooms.append({
            "room_id": r.id,
            "posts_id": r.posts_id,
            "buyer_id": r.buyer_id,
            "seller_id": post.seller_id if post else None
        })
        
    return SuccessResponse(data=user_rooms, message="참여 중인 채팅방 목록 조회가 완료되었습니다.")

# [실시간 웹소켓] 대화방 입장 및 실시간 메시지 송수신
@router.websocket("/ws/{chat_room_id}/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, chat_room_id: int, user_id: int):
    db_check = SessionLocal()
    room_exists = db_check.query(models.ChatRoom).filter(models.ChatRoom.id == chat_room_id).first()
    db_check.close()
    
    if not room_exists:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(chat_room_id, websocket)
    
    try:
        while True:
            raw_text = await websocket.receive_text()
            if not raw_text.strip():
                continue
                
            db_save = SessionLocal()
            try:
                db_message = models.ChatMessage(
                    chat_room_id=chat_room_id,
                    sender_id=user_id, # 필드명 매칭 변경
                    content=raw_text
                )
                db_save.add(db_message)
                db_save.commit()
                db_save.refresh(db_message)
                
                payload = MessagePayload(
                    chat_room_id=db_message.chat_room_id,
                    sender_id=db_message.sender_id,
                    content=db_message.content,
                    created_at=db_message.created_at
                )
            finally:
                db_save.close()
            
            await manager.broadcast_to_room(chat_room_id, payload.model_dump(mode="json"))
            
    except WebSocketDisconnect:
        manager.disconnect(chat_room_id, websocket)