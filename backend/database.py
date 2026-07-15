import os
from sqlalchemy import create_mock_engine, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL for SplitIt - defaults to local SQLite if not provided
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./splitit.db")

# SQLAlchemy 1.4+ requires postgresql:// instead of postgres://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# connect_args={"check_same_thread": False} is required only for SQLite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

# Create SQLAlchemy engine
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
