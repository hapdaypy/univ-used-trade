# QA 결과: release/1.0.0

## QA 개요

- 대상 브랜치: `release/1.0.0`
- 기준 커밋: `5773c654fad84c204b5a9418ba4b0eca510f396f`
- QA 일시: 2026-05-30
- 목적: Docker Compose 통합 이후 1차 릴리즈가 실행 가능한 상태인지 확인

## QA 환경

```text
OS: Windows
Docker Desktop: 실행됨
Docker Compose: 사용
실행 명령어: docker compose up --build -d
```

## 실행 검증

### 1. Docker Compose 설정 검증

명령어:

```bash
docker compose config
```

결과:

```text
PASS
```

비고:

```text
`version` 속성이 obsolete라는 경고가 있었으나 실행을 막는 오류는 아니었음.
추후 docker-compose.yml에서 version 항목 제거를 고려할 수 있음.
```

### 2. Docker Compose 빌드 및 실행

명령어:

```bash
docker compose up --build -d
```

결과:

```text
PASS
```

확인된 컨테이너:

```text
trade-db
backend-service
chat-service
frontend-service
```

### 3. 컨테이너 상태 확인

명령어:

```bash
docker compose ps
```

결과:

```text
PASS
```

확인 내용:

```text
backend-service: Up
chat-service: Up
frontend-service: Up
trade-db: Up (healthy)
```

## 서비스 응답 확인

### 1. 프론트엔드

주소:

```text
http://localhost:5500
```

결과:

```text
PASS - HTTP 200 OK
```

### 2. 백엔드 API 문서

주소:

```text
http://localhost:8000/docs
```

결과:

```text
PASS - HTTP 200 OK
```

### 3. 채팅 서비스 헬스 체크

주소:

```text
http://localhost:8001
```

결과:

```text
PASS - HTTP 200 OK
```

응답:

```json
{
  "status": "healthy",
  "service": "chat-service"
}
```

## 핵심 기능 QA

### 1. 회원가입

요청:

```text
POST /auth/users
```

결과:

```text
PASS - HTTP 201 Created
```

### 2. 로그인

요청:

```text
POST /auth/token
```

결과:

```text
PASS - access_token 발급 확인
```

### 3. 게시글 작성

요청:

```text
POST /posts
Authorization: Bearer token
```

결과:

```text
PASS - HTTP 201 Created
```

### 4. 게시글 목록 조회

요청:

```text
GET /posts
```

결과:

```text
PASS - 게시글 목록 응답 확인
```

### 5. 채팅방 생성

요청:

```text
POST /api/chat/rooms
```

조건:

```text
존재하는 판매자 user_id
존재하는 구매자 user_id
존재하는 posts_id
```

결과:

```text
PASS - success true 및 room_id 반환 확인
```

### 6. 채팅방 목록 조회

요청:

```text
GET /api/chat/rooms/{user_id}
```

결과:

```text
PASS - 판매자/구매자 양쪽에서 채팅방 목록 조회 확인
```

### 7. WebSocket 메시지 송수신

주소:

```text
ws://localhost:8001/api/chat/ws/{chat_room_id}/{user_id}
```

결과:

```text
PASS - 메시지 송신 후 같은 방으로 브로드캐스트된 JSON 메시지 수신 확인
```

수신 예시:

```json
{
  "chat_room_id": 5,
  "sender_id": 9,
  "content": "QA websocket message",
  "created_at": "2026-05-30T12:09:48.008055"
}
```

## 발견된 이슈 및 후속 처리

### 1. 존재하지 않는 buyer_id로 채팅방 생성 시 500 발생

요청 조건:

```text
존재하지 않는 buyer_id로 POST /api/chat/rooms 요청
```

결과:

```text
FAIL - Internal Server Error 발생
```

원인:

```text
chat_rooms.buyer_id가 users.id를 참조하는 외래키인데,
요청값의 buyer_id가 users 테이블에 존재하지 않아 DB ForeignKeyViolation 발생.
현재 해당 예외를 API 레벨에서 처리하지 않아 500으로 응답됨.
```

후속 처리:

```text
태규가 정리할 예외 처리 기준 이슈에 포함 필요.
핫픽스 단계에서 buyer_id 존재 여부를 먼저 검증하고,
존재하지 않을 경우 400 또는 404와 일관된 에러 응답을 반환하도록 수정 필요.
```

권장 응답 예시:

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "존재하지 않는 사용자입니다."
  }
}
```

## 최종 판단

```text
Docker Compose 통합 실행: PASS
프론트엔드 접속: PASS
백엔드 API 응답: PASS
채팅 서비스 응답: PASS
회원가입/로그인/게시글/채팅방/WebSocket 기본 흐름: PASS
예외 처리 일부 미흡: 확인됨, 핫픽스 대상으로 분류
```

`release/1.0.0`은 최소 실행 및 기본 기능 기준으로 릴리즈 후보로 사용할 수 있습니다.
다만 예외 처리 기준은 후속 hotfix에서 반드시 정리해야 합니다.
