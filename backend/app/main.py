from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.routes import uploads
from app.routes import cleaner
from app.routes import auth
from app.db import Base, engine
from app import models
from fastapi.middleware.cors import CORSMiddleware
import json

Base.metadata.create_all(bind=engine)

# Custom JSONResponse que fuerza UTF-8
class UTF8JSONResponse(JSONResponse):
    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
        ).encode("utf-8")

app = FastAPI(default_response_class=UTF8JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def read_health():
    return {"status": "ok"}

app.include_router(uploads.router)
app.include_router(cleaner.router, prefix="/clean", tags=["clean"])
