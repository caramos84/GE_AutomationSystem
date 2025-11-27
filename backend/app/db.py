import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

"""
This is a patched version of your original `app/db.py`. It removes the requirement
for a `DATABASE_URL` environment variable and instead falls back to using a
SQLite database located at `./app.db` if no environment variable is provided.

Usage:
    1. Replace your existing `app/db.py` file with this one, or copy the
       relevant sections into your current file.
    2. Ensure that when using SQLite (i.e., when `DATABASE_URL` starts with
       `sqlite`), SQLAlchemy passes `check_same_thread=False` in the
       connection arguments to avoid multi-threading issues in FastAPI.
    3. Everything else remains the same: `SessionLocal` and `Base` are
       created as before.

If you wish to use a different database (e.g., PostgreSQL, MySQL), set the
`DATABASE_URL` environment variable accordingly before starting your server.

Example for PostgreSQL:

    export DATABASE_URL=postgresql://user:password@localhost:5432/mydb
    uvicorn app.main:app --reload
"""

# Determine the database URL. If the environment variable is not set,
# default to a local SQLite database file named `app.db` in the
# current working directory.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# When using SQLite, SQLAlchemy requires special connection arguments.
# Specifically, `check_same_thread=False` allows the connection to be
# shared across multiple threads, which is necessary for many FastAPI
# applications running in multi-threaded mode.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create a configured "SessionLocal" class that will generate new Session
# objects connected to the engine. We set autocommit=False and
# autoflush=False to maintain control over when database transactions are
# committed and when data is flushed to the database.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# The base class for all ORM models (tables) defined in your application.
# Individual model classes should inherit from this Base.
Base = declarative_base()

# Dependency used in FastAPI to get a database session for each request.
# It ensures that the session is closed after the request is handled.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
