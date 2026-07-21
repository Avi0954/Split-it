# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import os
# from backend.database import engine, Base
# from backend.routes import auth, users, groups, expenses, settlements, preferences, dashboard
# from backend.models import user, group, expense, settlement, user_preferences # Ensure models are loaded for Base.metadata

# # Ensure uploads directory exists
# UPLOAD_DIR = os.path.join("backend", "uploads")
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# # Create the database tables (SQLite will create splitit.db automatically)
# # In production, use migrations (like Alembic)
# Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="SplitIt API",
#     description="Backend API for SplitIt - Expense Sharing and Management Application",
#     version="1.0.0"
# )

# # CORS configuration - Allow all origins for development
# # For production, specify only authorized origins
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Root route - Project sanity check
# @app.get("/")
# async def root():
#     return {"message": "SplitIt API Running 🚀"}

# # --- Modular Routes ---
# app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(groups.router, prefix="/groups", tags=["Groups"])
# app.include_router(expenses.router, prefix="/groups", tags=["Expenses"])
# app.include_router(settlements.router, tags=["Settlements"])
# app.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
# app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
import sys
import os

# Dynamically add the project root to sys.path so 'backend' module is always resolvable
# This fixes "ModuleNotFoundError: No module named 'backend'" regardless of where uvicorn is executed from
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
# Ensure we load the .env from the project root
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from fastapi import FastAPI, Request, status, Depends
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.utils.dependencies import get_db
import logging
import os
from backend.database import engine, Base
from backend.routes import auth, users, groups, expenses, settlements, preferences, dashboard, friends, websocket, notifications
from backend.models import user, group, expense, settlement, user_preferences, friendship, password_reset_token, push_subscription




# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SplitIt API",
    description="Backend API for SplitIt - Expense Sharing and Management Application",
    version="1.0.0"
)

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."}
    )

@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

# ✅ FIXED CORS CONFIG
# Load from environment variable for production (e.g., "https://my-app.vercel.app,https://my-app.com")
env_origins = os.environ.get("ALLOWED_ORIGINS")
if env_origins:
    origins = [origin.strip().rstrip('/') for origin in env_origins.split(",") if origin.strip()]
else:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",   # React frontend
        "http://127.0.0.1:5174",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SplitIt API Running 🚀"}

@app.get("/health")
async def health_check():
    """Basic health check to verify API is running."""
    return {"status": "ok"}

@app.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check to verify Database connection."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "database": "disconnected"}
        )



app.include_router(websocket.router, tags=["Websockets"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(groups.router, prefix="/api/groups", tags=["Groups"])
app.include_router(expenses.router, prefix="/api/groups", tags=["Expenses"])
app.include_router(settlements.router, prefix="/api", tags=["Settlements"])
app.include_router(preferences.router, prefix="/api/preferences", tags=["Preferences"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(friends.router, prefix="/api/friends", tags=["Friends"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])