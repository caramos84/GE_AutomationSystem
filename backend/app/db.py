import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback de desarrollo: si no hay DATABASE_URL, usamos SQLite local
if not DATABASE_URL:
    print("⚠️ WARNING: DATABASE_URL is not set. Using local SQLite dev.db")
    DATABASE_URL = "sqlite:///./dev.db"

# Ajuste necesario cuando usamos SQLite
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
Base.metadata.create_all(bind=engine)
