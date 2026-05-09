# SplitIt - Premium Expense Sharing Application

SplitIt is a modern, premium fintech-inspired expense sharing application. It helps friends and groups track shared costs, settle debts, and manage financial activities with a sleek, dark-themed dashboard.

## 🚀 Key Features

- **Group Management**: Create and manage groups for shared expenses.
- **Smart Settlements**: Calculate who owes whom and settle debts with one click.
- **Activity Feed**: Real-time tracking of all financial interactions.
- **Invite System**: Generate unique referral links for new users.
- **Premium UI**: Dark mode, lavender-accented interface with smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), SQLAlchemy.
- **Database**: SQLite (Local), PostgreSQL (Production ready).
- **Authentication**: JWT (JSON Web Tokens).

## 💻 Local Setup

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/splitit.git
cd splitit
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn backend.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
- `DATABASE_URL`: Connection string for production (PostgreSQL).
- `SECRET_KEY`: Long random string for JWT security.
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains.

### Frontend (frontend/.env)
- `VITE_API_URL`: Backend API base URL.

## 🚢 Deployment Overview

- **Frontend**: Deploy `frontend/dist` to **Vercel** or **Netlify**.
- **Backend**: Deploy `backend/` to **Railway**, **Render**, or **DigitalOcean**.
- **Database**: Use **Neon** or **Supabase** for managed PostgreSQL.

---
Built with 💜 by SplitIt Team.
