# Campus Market

오픈소스SW개론 팀프로젝트로 진행한 캠퍼스 중고거래 웹 서비스입니다.

사용자는 회원가입과 로그인을 한 뒤 판매 게시글을 작성하고, 관심 있는 상품에 대해 판매자와 1:1 채팅을 생성할 수 있습니다. 후반부에는 가상 머니 기반 결제 기능과 거래 내역 조회 기능을 추가하였고, v2.2.0에서는 교내 중고거래 플랫폼의 성격을 강화하기 위해 게시글별 교내 교환 장소 선택 기능을 추가했습니다.

## 주요 기능

- 회원가입 및 로그인
- JWT 기반 현재 사용자 조회
- 판매 게시글 작성, 목록 조회, 상세 조회
- 게시글별 가격, 판매 상태, 교내 교환 장소 관리
- 게시글 기반 1:1 채팅방 생성
- WebSocket 기반 실시간 메시지 송수신
- 회원가입 시 기본 지갑 생성 및 가상 머니 지급
- 가상 머니 기반 구매 처리
- 구매자 잔액 차감 및 판매자 잔액 증가
- 거래 내역 조회
- 마이페이지 구매 내역 조회
- Docker Compose 기반 전체 서비스 통합 실행

## 교내 교환 장소

v2.2.0부터 판매자는 게시글 작성 시 교내 교환 장소를 선택해야 합니다.

지원하는 교내 장소는 다음과 같습니다.

- 학술정보원
- 영실관
- 충무관
- 대양센터
- 대양홀
- 헹복기숙사
- 군자관
- 집현관
- 용덕관
- 이당관
- 광개토관

선택한 장소는 게시글 목록, 상품 상세 화면, 채팅방 거래 상품 요약, 거래 내역, 마이페이지 구매 내역에 표시됩니다. 백엔드는 허용된 장소 목록에 없는 값이 들어오면 400 응답을 반환합니다.

## 기술 스택

| 구분 | 사용 기술 |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, FastAPI, SQLModel |
| Chat Service | FastAPI, WebSocket |
| Database | PostgreSQL |
| Infra | Docker, Docker Compose |

## 프로젝트 구조

```text
univ-used-trade/
├─ backend/          # 인증, 게시글, 결제 API
├─ chat-service/     # 채팅방 및 WebSocket 메시지 서비스
├─ docker/           # PostgreSQL 초기 스키마
├─ docs/             # Git Flow, QA, 릴리즈 문서
├─ frontend/         # HTML/CSS/JavaScript 프론트엔드
├─ docker-compose.yml
└─ README.md
```

## Docker Compose 실행

Docker Desktop을 실행한 뒤 프로젝트 루트에서 아래 명령을 실행합니다.

```bash
docker compose up --build
```

백그라운드 실행이 필요하면 다음 명령을 사용할 수 있습니다.

```bash
docker compose up --build -d
```

서비스 접속 주소는 다음과 같습니다.

| 서비스 | 주소 |
|---|---|
| Frontend | http://localhost:5500 |
| Backend Swagger | http://localhost:8000/docs |
| Chat Service Health | http://localhost:8001/ |
| PostgreSQL | localhost:5432 |

컨테이너 상태 확인:

```bash
docker compose ps
```

서비스 종료:

```bash
docker compose down
```

DB 스키마 변경 후 초기화가 필요할 때:

```bash
docker compose down -v
docker compose up --build
```

`posts` 테이블에 컬럼이 추가되는 등 DB 스키마가 변경된 경우 기존 PostgreSQL 볼륨에 이전 스키마가 남아 있을 수 있으므로 `docker compose down -v`로 볼륨을 제거한 뒤 다시 실행해야 합니다.

## 환경 변수

`docker-compose.yml`은 기본값을 포함하고 있으므로 별도 `.env` 없이도 실행할 수 있습니다.

| 변수 | 기본값 | 설명 |
|---|---|---|
| `DB_NAME` | `campus_db` | PostgreSQL DB 이름 |
| `DB_USER` | `user` | PostgreSQL 사용자 |
| `DB_PASSWORD` | `password` | PostgreSQL 비밀번호 |

백엔드와 채팅 서비스는 Docker Compose 내부 네트워크에서 다음 DB URL을 사용합니다.

```text
postgresql://user:password@trade-db:5432/campus_db
```

## API 요약

### 인증 API

| Method | Endpoint | 설명 |
|---|---|---|
| `POST` | `/auth/users` | 회원가입 |
| `POST` | `/auth/token` | 로그인 및 JWT 토큰 발급 |
| `GET` | `/auth/users/me/` | 현재 로그인 사용자 조회 |

### 게시글 API

| Method | Endpoint | 설명 |
|---|---|---|
| `POST` | `/posts` | 게시글 작성 |
| `GET` | `/posts` | 게시글 목록 조회 |
| `GET` | `/posts/{post_id}` | 게시글 상세 조회 |

게시글 작성 예시:

```json
{
  "title": "전공책 판매",
  "content": "필기 적고 상태 좋습니다.",
  "price": 15000,
  "trade_location": "학술정보원"
}
```

게시글 응답에는 다음 값이 포함됩니다.

```json
{
  "id": 1,
  "seller_id": 1,
  "title": "전공책 판매",
  "content": "필기 적고 상태 좋습니다.",
  "price": 15000,
  "trade_location": "학술정보원",
  "status": "available",
  "created_at": "2026-06-08T12:00:00"
}
```

### 채팅 API

| Method | Endpoint | 설명 |
|---|---|---|
| `POST` | `/api/chat/rooms` | 채팅방 생성 |
| `GET` | `/api/chat/rooms/{user_id}` | 참여 중인 채팅방 목록 조회 |
| `WS` | `/api/chat/ws/{chat_room_id}/{user_id}` | 실시간 메시지 송수신 |

채팅방은 게시글 ID와 구매자 ID를 기준으로 생성됩니다. 구매자와 판매자가 같은 경우 채팅방을 생성할 수 없으며, 동일한 게시글과 구매자 조합의 채팅방이 이미 있으면 기존 방을 반환합니다.

### 결제 API

| Method | Endpoint | 설명 |
|---|---|---|
| `GET` | `/payment/wallet` | 현재 사용자 지갑 조회 |
| `POST` | `/payment/transactions` | 구매 요청 |
| `GET` | `/payment/transactions` | 내 거래 내역 조회 |

구매 요청 예시:

```json
{
  "post_id": 1
}
```

결제 처리 시 구매자 지갑에서 상품 가격만큼 차감되고, 판매자 지갑에 같은 금액이 증가합니다. 결제 완료 후 게시글 상태는 `sold`로 변경되고, 거래 내역에는 상품명, 상품 내용, 교내 교환 장소가 함께 포함됩니다.

## 프론트엔드 사용 흐름

1. `http://localhost:5500` 접속
2. 회원가입 또는 로그인
3. 게시글 화면에서 제목, 내용, 가격, 교내 교환 장소를 입력해 상품 등록
4. 게시글 목록 또는 상세 화면에서 상품 정보 확인
5. 채팅방 생성 후 판매자와 거래 대화
6. 구매하기 버튼으로 가상 머니 결제
7. 결제 화면에서 지갑 잔액과 거래 내역 확인
8. 마이페이지에서 구매한 물건과 교내 교환 장소 확인

## Git Flow 및 릴리즈

프로젝트는 Git Flow 방식으로 진행했습니다.

| 브랜치 | 목적 |
|---|---|
| `main` | 최종 안정 버전 |
| `develop` | 기능 통합 및 테스트 |
| `feature/*` | 개별 기능 개발 |
| `release/*` | 릴리즈 전 QA 및 안정화 |
| `hotfix/*` | main 기준 긴급 수정 |

주요 릴리즈는 다음과 같습니다.

| 버전 | 내용 |
|---|---|
| `v1.0.0` | 회원가입, 로그인, 게시글, 채팅, Docker Compose 통합 |
| `v2.0.0` | 가상 머니 결제 API, 지갑, 거래 내역, 게시글 판매 상태 |
| `v2.1.0` | 상품 상세 구매, 채팅방 구매 버튼, 마이페이지 구매 내역 개선 |
| `v2.2.0` | 교내 교환 장소 선택 및 거래 화면 표시 |

## QA 문서

릴리즈별 QA 결과는 `docs/` 폴더에 정리했습니다.

| 문서 | 설명 |
|---|---|
| `docs/QA_RELEASE_1_0_0.md` | 1차 릴리즈 QA |
| `docs/QA_RELEASE_2_0_0.md` | 결제 기능 포함 2차 릴리즈 QA |
| `docs/QA_RELEASE_2_2_0.md` | 교내 교환 장소 기능 QA |

QA는 Docker Compose 실행, 서비스 HTTP 응답, 핵심 API 시나리오, 프론트엔드 동작 확인을 중심으로 진행했습니다.

## 오류 응답 형식

백엔드와 채팅 서비스는 주요 예외 응답을 다음 형식으로 통일했습니다.

```json
{
  "success": false,
  "data": null,
  "message": "오류 메시지"
}
```

이를 통해 프론트엔드가 서비스별 오류 응답을 안정적으로 처리할 수 있도록 했습니다.

## 로컬 프론트엔드만 실행하기

Docker Compose를 사용하지 않고 프론트엔드만 확인하려면 다음 명령을 사용할 수 있습니다.

```bash
cd frontend
python -m http.server 5500
```

단, 실제 회원가입, 게시글, 채팅, 결제 기능을 확인하려면 백엔드 API와 채팅 서비스가 함께 실행되어야 합니다.

## 참고

- 프론트엔드 기본 Backend API 주소: `http://localhost:8000`
- 프론트엔드 기본 Chat API 주소: `http://localhost:8001`
- API 주소는 화면 상단 입력값을 통해 변경할 수 있습니다.
- API 연결에 실패하면 일부 화면은 localStorage 기반 fallback 데이터를 표시합니다.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
