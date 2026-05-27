FROM python:latest

WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . ./backend

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
