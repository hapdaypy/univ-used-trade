# Campus Market Frontend

백엔드 `develop` 브랜치 기준으로 만든 순수 HTML/CSS/JavaScript 프론트엔드입니다.

## 화면 구성

- 게시글: 판매 게시글 목록, 게시글 작성, 채팅 시작
- 채팅: 채팅방 생성, 채팅방 목록 조회, 실시간 메시지 송수신
- 프로젝트: 보고서에 정리할 구현 범위와 백엔드 추가 필요 사항

## 실행

```bash
cd frontend
python -m http.server 5500
```

브라우저에서 `http://localhost:5500`으로 접속합니다.

## 현재 연동 상태

- 회원가입: `POST /auth/users`
- 로그인: `POST /auth/token`
- 현재 사용자 조회: `GET /auth/users/me/`
- 게시글 목록: `GET /posts`
- 게시글 작성: `POST /posts`
- 채팅방 생성: `POST /api/chat/rooms`
- 채팅방 목록: `GET /api/chat/rooms/{user_id}`
- 실시간 채팅: `WS /api/chat/ws/{chat_room_id}/{user_id}`

로그인과 게시글은 백엔드 API와 연동하고, 채팅은 별도 채팅 서비스 API와 연동합니다. API 연결이 실패하면 게시글 목록과 채팅방은 시연 가능한 fallback 데이터로 동작합니다.

## 백엔드 연동 전 확인할 점

백엔드 API는 기본값 `http://localhost:8000`, 채팅 API는 기본값 `http://localhost:8001`을 사용합니다. 화면의 API 입력값을 바꾸면 다른 주소의 서버에도 연결할 수 있습니다.
