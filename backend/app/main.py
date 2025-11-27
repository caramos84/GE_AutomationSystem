from fastapi import FastAPI
from app.routes import uploads

from app.db import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/health")
def read_health():
    return {"status": "ok"}

app.include_router(uploads.router)
