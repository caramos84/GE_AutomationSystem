from fastapi import FastAPI
from app.routes import uploads
from app.routes import cleaner
from app.routes import auth
from app.db import Base, engine
from app import models
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

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
