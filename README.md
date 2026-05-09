# SplitIt - FastAPI Backend Boilerplate

SplitIt is a modern web application for expense sharing and management. This repository contains the backend API built with FastAPI.

## Tech Stack
- **FastAPI**: Modern, fast (high-performance) web framework.
- **SQLAlchemy ORM**: Database object-relational mapping.
- **SQLite**: Default SQL database (production ready with PostgreSQL).
- **Uvicorn**: ASGI server implementation for Python.

## Project Structure
```text
backend/
├── main.py          # Entry point and application configuration
├── database.py      # SQLAlchemy engine and session setup
├── models/          # Database models (SQLAlchemy)
├── schemas/         # Pydantic models for data validation
├── routes/          # API route definitions (APIRouter)
└── utils/           # Utility functions and helpers
requirements.txt     # Python dependencies
.gitignore           # Files and folders to exclude from version control
```

## Getting Started

### 1. Prerequisites
- Python 3.8+ installed.

### 2. Setup Virtual Environment (Recommended)
```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
From the root directory, run:
```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://127.0.0.1:8000/`.

## API Documentation
Once the server is running, you can access the interactive documentation:
- Swagger UI (OpenAPI): `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
