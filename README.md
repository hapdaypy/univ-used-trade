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

프론트엔드 채팅 화면은 기본적으로 아래 주소의 채팅 API를 호출합니다.

```text
http://localhost:8000
```

연동 API는 다음과 같습니다.

- `POST /api/chat/rooms`: 채팅방 생성
- `GET /api/chat/rooms/{user_id}`: 참여 중인 채팅방 목록 조회
- `WS /api/chat/ws/{chat_room_id}/{user_id}`: 실시간 메시지 송수신

## 현재 프론트엔드 구현 범위

- 로그인 사용자 입력 UI
- 판매 게시글 목록 UI
- 판매 게시글 작성 UI
- 채팅방 생성 UI
- 채팅방 목록 조회 UI
- WebSocket 기반 실시간 채팅 UI
- 백엔드 API 미연결 상황에서도 시연 가능한 localStorage 기반 더미 데이터

## 참고 사항

현재 `develop` 브랜치에는 채팅 API가 우선 구현되어 있으며, 로그인과 게시글 API는 아직 완성되지 않았습니다. 따라서 프론트엔드의 로그인과 게시글 기능은 더미 데이터 기반으로 동작하고, 추후 백엔드 API가 추가되면 `frontend/app.js`의 API 호출 함수만 교체하여 연동할 수 있습니다.
