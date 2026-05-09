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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.database import engine, Base
from backend.routes import auth, users, groups, expenses, settlements, preferences, dashboard, friends
from backend.models import user, group, expense, settlement, user_preferences, friendship

UPLOAD_DIR = os.path.join("backend", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SplitIt API",
    description="Backend API for SplitIt - Expense Sharing and Management Application",
    version="1.0.0"
)

# CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
if allowed_origins_env:
    origins.extend(allowed_origins_env.split(","))

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

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(groups.router, prefix="/groups", tags=["Groups"])
app.include_router(expenses.router, prefix="/groups", tags=["Expenses"])
app.include_router(settlements.router, tags=["Settlements"])
app.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(friends.router, prefix="/friends", tags=["Friends"])