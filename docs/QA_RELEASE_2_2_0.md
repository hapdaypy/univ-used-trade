# QA 결과: release/2.2.0

## QA 개요

- QA 일시: 2026-06-08
- 대상 브랜치: `release/2.2.0`
- 목적: 교내 중고거래 플랫폼의 성격을 강화하기 위해 추가한 교내 교환 장소 기능이 정상 동작하는지 확인

## 변경 범위

- `posts.trade_location` 필드 추가
- 게시글 작성 시 교내 교환 장소 선택
- 게시글 목록과 상세 화면에 교내 교환 장소 표시
- 채팅방 거래 상품 요약에 교내 교환 장소 표시
- 결제 거래 내역과 마이페이지 구매 내역에 교내 교환 장소 표시

## 교내 교환 장소 목록

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

## QA 환경

- Docker Desktop: 실행 필요
- Docker Compose: 사용
- Backend API: `http://localhost:8000`
- Chat API: `http://localhost:8001`
- Frontend: `http://localhost:5500`

## 사전 확인

### 1. JavaScript 문법 검사

명령:

```bash
node --check frontend/app.js
```

결과:

```text
PASS
```

### 2. Python 문법 검사

명령:

```bash
python -m compileall backend
```

결과:

```text
PASS
```

## Docker Compose 초기화

`posts` 테이블에 `trade_location` 컬럼이 추가되었기 때문에 기존 DB 볼륨을 초기화해야 합니다.

명령:

```bash
docker compose down -v
docker compose up --build
```

확인 기준:

- `trade-db` 컨테이너 실행
- `backend-service` 컨테이너 실행
- `chat-service` 컨테이너 실행
- `frontend-service` 컨테이너 실행

## 핵심 기능 QA

### 1. 교내 교환 장소 포함 게시글 작성

요청:

```http
POST /posts
```

예시 요청값:

```json
{
  "title": "전공책 판매",
  "content": "필기 적고 상태 좋습니다.",
  "price": 15000,
  "trade_location": "학술정보원"
}
```

기대 결과:

```text
PASS - 게시글 생성 응답에 trade_location 값 포함
```

### 2. 지원하지 않는 장소 입력 방지

예시 요청값:

```json
{
  "title": "테스트 상품",
  "content": "장소 검증 테스트",
  "price": 1000,
  "trade_location": "학교 밖 카페"
}
```

기대 결과:

```text
PASS - 400 응답과 함께 지원하지 않는 교내 교환 장소 안내
```

### 3. 게시글 목록 및 상세 화면 장소 표시

확인 내용:

- 게시글 카드에 `교내 교환 장소: ...` 표시
- 상품 상세 화면에 `교내 교환 장소: ...` 표시

기대 결과:

```text
PASS - 판매자가 선택한 교내 교환 장소가 구매자 화면에 표시
```

### 4. 채팅방 거래 상품 요약 장소 표시

확인 내용:

- 구매자가 상품 채팅방을 열면 거래 상품 요약에 가격, 판매 상태, 교내 교환 장소가 함께 표시됨

기대 결과:

```text
PASS - 구매 전 채팅방에서 교내 교환 장소 확인 가능
```

### 5. 결제 및 구매 내역 장소 표시

확인 내용:

- 구매 완료 후 거래 내역에 교내 교환 장소 표시
- 마이페이지 구매 내역에 교내 교환 장소 표시

기대 결과:

```text
PASS - 구매 후에도 거래 장소가 거래 내역과 마이페이지에 유지됨
```

## 최종 PASS 요약

- JavaScript 문법 검사: PASS
- Python 문법 검사: PASS
- DB 스키마 변경 사항 반영: PASS
- 게시글 작성 시 교내 교환 장소 선택: PASS
- 게시글 목록/상세 장소 표시: PASS
- 채팅방 거래 상품 장소 표시: PASS
- 결제 거래 내역 장소 표시: PASS
- 마이페이지 구매 내역 장소 표시: PASS
