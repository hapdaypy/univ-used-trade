# 릴리즈 진행 계획

이 문서는 1차 릴리즈부터 2차 릴리즈까지의 개발 순서, 브랜치 전략, 담당 작업을 정리한 문서입니다.

## 전체 브랜치 흐름

이번 일정에서는 Git Flow 방식을 기준으로 진행합니다.

```text
feature/* -> develop
develop -> release/1.0.0
release/1.0.0 -> main
release/1.0.0 -> develop
main -> hotfix/*
hotfix/* -> main
hotfix/* -> develop
develop -> feature/test
feature/test -> develop
develop -> release/2.0.0
release/2.0.0 -> main
```

릴리즈 태그는 다음과 같이 사용합니다.

```text
v1.0.0
v1.1.0
v2.0.0
```

## 1. 목요일~금요일: Docker Compose 통합

### 작업 내용

- 민욱, 재용이 각각 Docker Compose 브랜치를 생성한다.
- 환경 변수 설정을 확인한다.
- 포트 충돌 여부를 확인한다.
- 컨테이너 간 연결 상태를 확인한다.
- 두 작업 중 더 적절한 방식을 선택한다.
- 선택한 Docker Compose 구성을 `develop` 브랜치에 병합한다.

### 사용 브랜치

```text
feature/docker-compose-minwook
feature/docker-compose-jaeyong
```

### 병합 방향

```text
feature/docker-compose-minwook -> develop
feature/docker-compose-jaeyong -> develop
```

두 브랜치의 작업을 비교한 뒤, 최종적으로 사용할 방식만 `develop`에 반영합니다.

## 2. 금요일: 1차 릴리즈

### 작업 내용

- `develop` 브랜치를 기준으로 `release/1.0.0` 브랜치를 생성한다.
- 간단한 QA를 진행한다.
- Docker Compose로 실행 가능한 상태인지 확인한다.
- 주요 기능이 정상 동작하는지 확인한다.
- 문제가 없으면 `main` 브랜치에 병합한다.
- `v1.0.0` 태그를 생성한다.

### 사용 브랜치

```text
release/1.0.0
```

### 병합 방향

```text
develop -> release/1.0.0
release/1.0.0 -> main
release/1.0.0 -> develop
```

### 태그

```text
v1.0.0
```

## 3. 토요일~일요일: 예외 처리 기준 정리

### 작업 내용

- 태규가 에러 반환 방식에 대한 이슈를 작성한다.
- HTTP status code 기준을 정리한다.
- 에러 message 형식을 정리한다.
- 프론트엔드에서 받을 에러 응답 구조를 정리한다.

### 정리할 내용

```text
- status code
- error code
- message
- 프론트엔드 응답 처리 방식
```

### 에러 응답 예시

```json
{
  "success": false,
  "error": {
    "code": "AUTH_REQUIRED",
    "message": "로그인이 필요합니다."
  }
}
```

## 4. 토요일~월요일: 핫픽스

### 작업 내용

- `main` 브랜치에서 hotfix 브랜치를 생성한다.
- 예외 처리 코드를 작성한다.
- 수정된 내용을 `main` 브랜치에 병합한다.
- 같은 수정 내용을 `develop` 브랜치에도 병합한다.
- `v1.1.0` 릴리즈 태그를 생성한다.

### 사용 브랜치

```text
hotfix/exception-handling
```

### 병합 방향

```text
main -> hotfix/exception-handling
hotfix/exception-handling -> main
hotfix/exception-handling -> develop
```

### 태그

```text
v1.1.0
```

핫픽스는 반드시 `main` 기준으로 생성합니다. 수정 후에는 `main`과 `develop` 양쪽에 모두 반영해야 합니다.

## 5. 월요일~화요일: 테스트 코드 작성

### 작업 내용

- 재용, 재현이 `develop` 브랜치에서 `feature/test` 브랜치를 생성한다.
- 주요 API에 대한 유닛 테스트를 작성한다.
- 예외 처리에 대한 테스트를 작성한다.
- 테스트 통과 여부를 확인한다.
- Pull Request를 생성한 뒤 `develop`에 병합한다.

### 사용 브랜치

```text
feature/test
```

### 병합 방향

```text
develop -> feature/test
feature/test -> develop
```

### 테스트 대상

```text
- 회원가입 API
- 로그인 API
- 게시글 API
- 채팅 관련 API
- 예외 처리 응답
```

## 6. 화요일~수요일: 2차 릴리즈

### 작업 내용

- 테스트 코드가 `develop`에 반영되었는지 확인한다.
- 간단한 프론트엔드 수정 또는 안정성 개선을 진행한다.
- `release/2.0.0` 브랜치를 생성한다.
- 최종 QA를 진행한다.
- 문제가 없으면 `main` 브랜치에 병합한다.
- `v2.0.0` 릴리즈 태그를 생성한다.

### 사용 브랜치

```text
release/2.0.0
```

### 병합 방향

```text
develop -> release/2.0.0
release/2.0.0 -> main
release/2.0.0 -> develop
```

### 태그

```text
v2.0.0
```

## 브랜치별 역할 요약

```text
main
- 최종 제출 가능한 안정 버전

develop
- 기능 통합 및 테스트용 브랜치

feature/*
- 기능 개발 브랜치

release/*
- 릴리즈 전 QA 및 안정화 브랜치

hotfix/*
- main 기준 긴급 수정 브랜치
```

## 주의 사항

```text
- main 브랜치에서 직접 개발하지 않는다.
- develop 브랜치에서도 직접 개발하지 않는다.
- 기능 개발은 feature 브랜치에서 진행한다.
- 릴리즈 준비는 release 브랜치에서 진행한다.
- 긴급 수정은 hotfix 브랜치에서 진행한다.
- hotfix 수정은 main과 develop 양쪽에 반영한다.
- 태그는 main에 병합된 안정 버전에만 생성한다.
```
