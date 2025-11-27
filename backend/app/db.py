import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1) URL de la base de datos
#    - Si hay DATABASE_URL en el entorno (Postgres/MySQL en futuro), la usamos.
#    - Si NO hay, usamos SQLite local en app.db (modo desarrollo).
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# 2) Crear el engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# 3) Session y Base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 4) Importa los modelos para que SQLAlchemy conozca las tablas
from . import models  # noqa: F401

# 5) Crea las tablas si no existen (incluida file_uploads)
Base.metadata.create_all(bind=engine)
