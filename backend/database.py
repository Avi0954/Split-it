from sqlalchemy import create_mock_engine, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL for SplitIt
SQLALCHEMY_DATABASE_URL = "sqlite:///./splitit.db"

# Create SQLAlchemy engine
# connect_args={"check_same_thread": False} is required only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
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
