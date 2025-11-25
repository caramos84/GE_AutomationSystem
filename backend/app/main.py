# backend/app/main.py
from fastapi import FastAPI

from app.routes import uploads  # 👈 importa el router

app = FastAPI()


@app.get("/health")
def read_health():
    return {"status": "ok"}


# 👇 monta el router SIN prefix extra
app.include_router(uploads.router)
