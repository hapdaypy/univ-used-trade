# univ-used-trade
오픈소스SW개론 팀프로젝트

## 프로젝트 소개

캠퍼스 구성원을 위한 중고거래 웹 서비스입니다. 사용자는 판매 게시글을 확인하고, 관심 있는 게시글의 판매자와 1:1 채팅을 통해 거래를 진행할 수 있습니다.

## 기술 스택

- Frontend: HTML, CSS, JavaScript
- Backend: Python, FastAPI
- Database: PostgreSQL
- Realtime: WebSocket
- Infra: Docker

## 프론트엔드 실행

```bash
cd frontend
python -m http.server 5500
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5500
```

## 채팅 백엔드 실행 기준

프론트엔드는 백엔드 API와 채팅 API 주소를 분리해서 사용합니다.

```text
Backend API: http://localhost:8000
Chat API: http://localhost:8001
```

연동 API는 다음과 같습니다.

- `POST /auth/users`: 회원가입
- `POST /auth/token`: 로그인 및 JWT 토큰 발급
- `GET /auth/users/me/`: 현재 사용자 조회
- `GET /posts`: 게시글 목록 조회
- `POST /posts`: 게시글 작성
- `POST /api/chat/rooms`: 채팅방 생성
- `GET /api/chat/rooms/{user_id}`: 참여 중인 채팅방 목록 조회
- `WS /api/chat/ws/{chat_room_id}/{user_id}`: 실시간 메시지 송수신

## 현재 프론트엔드 구현 범위

- 회원가입/로그인 API 연동 UI
- 판매 게시글 목록 API 연동 UI
- 판매 게시글 작성 API 연동 UI
- 채팅방 생성 UI
- 채팅방 목록 조회 UI
- WebSocket 기반 실시간 채팅 UI
- API 연결 실패 상황에서도 시연 가능한 localStorage 기반 fallback 데이터

## 참고 사항

채팅 서비스와 백엔드 API 서버는 모두 기본 Dockerfile에서 8000 포트를 사용하므로 동시에 실행할 때는 채팅 서비스를 8001 등 별도 포트로 실행해야 합니다.
