# 파이썬이 설치된 가벼운 이미지를 가져옴
FROM python:3.11-slim
# 작업 폴더 지정
WORKDIR /app
# 프론트엔드 폴더의 모든(HTML, JS, CSS 등) 파일을 컨테이너 내부로 복사
COPY . .
# 5500 포트 개방
EXPOSE 5500
# README에 적혀있던 파이썬 서버 실행 명령어
CMD ["python", "-m", "http.server", "5500"]