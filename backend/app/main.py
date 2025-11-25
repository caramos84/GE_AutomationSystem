from fastapi import FastAPI
from app.routes import uploads

app = FastAPI()

@app.get("/health")
def read_health():
    return {"status": "ok"}

app.include_router(uploads.router)
