import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. URL de la base de datos
# Si no tienes variable de entorno, esto crea un SQLite local "app.db" en backend/app/
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# 2. Engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# 3. Session + Base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 4. IMPORTAR MODELOS ANTES DEL create_all  ⬅️ ESTO ES LO QUE FALTABA
from . import models  # noqa: E402,F401

# 5. Crear las tablas
Base.metadata.create_all(bind=engine)
