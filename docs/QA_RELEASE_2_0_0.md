# QA 결과: release/2.0.0

## QA 개요

- 대상 브랜치: `release/2.0.0`
- 기준 커밋: `14d2e7cc4d561eeea3039801aa948032875aa247`
- QA 일시: 2026-06-03
- 목적: 결제 API와 결제 프론트엔드가 포함된 2차 릴리즈가 실행 가능한 상태인지 확인

## 주요 변경 사항

```text
- 가상 머니 결제 API 추가
- 게시글 price/status 필드 추가
- 회원가입 시 기본 지갑 잔액 10,000,000원 지급
- 구매자 지갑에서 판매자 지갑으로 결제 금액 이체
- 거래 내역 transactions 테이블 저장
- 프론트엔드 결제 탭 추가
- 게시글 가격 및 판매 상태 표시
- 구매하기 버튼 및 결제 API 연동
- 지갑 잔액 및 거래 내역 조회 UI 추가
```

## QA 환경

```text
OS: Windows
Docker Desktop: 실행됨
Docker Compose: 사용
Frontend: http://localhost:5500
Backend API: http://localhost:8000
Chat API: http://localhost:8001
```

## 실행 검증

### 1. JavaScript 문법 검사

명령어:

```bash
node --check frontend/app.js
```

결과:

```text
PASS
```

### 2. Docker Compose 초기화

결제 API에서 DB 스키마가 변경되었기 때문에 기존 DB 볼륨을 초기화했습니다.

명령어:

```bash
docker compose down -v
```

결과:

```text
PASS
```

### 3. Docker Compose 빌드 및 실행

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

### 4. 컨테이너 상태 확인

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

비고:

```text
docker-compose.yml의 version 속성이 obsolete라는 경고가 출력되었으나 실행을 막는 오류는 아님.
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
PASS - 판매자/구매자 회원가입 성공
```

### 2. 로그인

요청:

```text
POST /auth/token
```

결과:

```text
PASS - 판매자/구매자 access_token 발급 확인
```

### 3. 가격 포함 게시글 작성

요청:

```text
POST /posts
Authorization: Bearer token
```

요청 데이터:

```json
{
  "title": "v2 결제 QA 상품",
  "content": "release 2.0.0 결제 흐름 확인",
  "price": 42000
}
```

결과:

```text
PASS - price 포함 게시글 생성 확인
```

### 4. 채팅방 생성

요청:

```text
POST /api/chat/rooms
```

조건:

```text
존재하는 posts_id
존재하는 buyer_id
```

결과:

```text
PASS - success true 반환 확인
```

### 5. 결제 전 구매자 지갑 조회

요청:

```text
GET /payment/wallet
Authorization: Bearer buyer_token
```

결과:

```text
PASS - 구매자 초기 잔액 10,000,000원 확인
```

### 6. 결제 요청

요청:

```text
POST /payment/transactions
Authorization: Bearer buyer_token
```

요청 데이터:

```json
{
  "post_id": 1
}
```

결과:

```text
PASS - transaction 생성 확인
```

### 7. 결제 후 지갑 변동 확인

검증 값:

```text
before_buyer_money: 10000000
transaction_amount: 42000
after_buyer_money: 9958000
seller_money: 10042000
```

결과:

```text
PASS - 구매자 잔액 차감 및 판매자 잔액 증가 확인
```

### 8. 거래 내역 조회

요청:

```text
GET /payment/transactions
Authorization: Bearer buyer_token
```

결과:

```text
PASS - 거래 내역 1건 생성 확인
```

### 9. 게시글 판매 상태 변경 확인

요청:

```text
GET /posts
```

결과:

```text
PASS - 결제 완료 후 게시글 status가 sold로 변경됨
```

## 최종 검증 값

```json
{
  "seller_id": 1,
  "buyer_id": 2,
  "post_id": 1,
  "post_price": 42000,
  "room_success": true,
  "before_buyer_money": 10000000,
  "transaction_amount": 42000,
  "after_buyer_money": 9958000,
  "seller_money": 10042000,
  "transaction_count": 1,
  "post_status": "sold"
}
```

## 최종 판단

```text
Docker Compose 통합 실행: PASS
프론트엔드 접속: PASS
백엔드 API 응답: PASS
채팅 서비스 응답: PASS
회원가입/로그인: PASS
가격 포함 게시글 작성: PASS
채팅방 생성: PASS
지갑 조회: PASS
결제 요청: PASS
거래 내역 조회: PASS
게시글 sold 상태 변경: PASS
```

`release/2.0.0`은 결제 기능과 프론트엔드 결제 UI가 포함된 2차 릴리즈 후보로 사용할 수 있습니다.
