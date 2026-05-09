from sqlalchemy import create_mock_engine, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

# Database URL configuration
# In production, use DATABASE_URL (e.g. PostgreSQL)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./splitit.db")

# Create SQLAlchemy engine
is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models to inherit from
Base = declarative_base()

# Dependency function to get a database session and ensure it closes after request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
