from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging

app = FastAPI(
    title="Campus Used Marketplace - Chatting Service",
    version="1.0.0"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "message": "잘못된 요청 형식입니다."
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"서버 내부 오류: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        }
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
