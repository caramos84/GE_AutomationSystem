import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1) URL de la base de datos
#   - Si hay DATABASE_URL en el entorno, la usamos (para Postgres/MySQL en futuro).
#   - Si NO hay, usamos SQLite local en app.db (modo desarrollo).
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2) Importa los modelos para que SQLAlchemy conozca FileUpload y compañía
#    (IMPORTANTE: el import es relativo porque db.py está dentro de app/)
from . import models  # noqa: F401

# 3) Crea las tablas si no existen
Base.metadata.create_all(bind=engine)
