from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat

app = FastAPI(
    title="Campus Used Marketplace - Chatting Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# chat 라우터 코드를 메인 시스템에 마운트
app.include_router(chat.router)

# 서버가 살아있는지 확인
@app.get("/")
def health_check():
    return {"status": "healthy", "service": "chat-service"}
