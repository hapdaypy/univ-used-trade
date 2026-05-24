from dotenv import load_dotenv
load_dotenv()


from fastapi import FastAPI
from .auth.controller import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
    