import sqlite3
from passlib.context import CryptContext

# Security configuration (matching backend/utils/security.py)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def seed_admin():
    email = "admin@splitit.com"
    password = "admin_password_2026"
    name = "SplitIt Administrator"
    
    hashed_pw = hash_password(password)
    
    try:
        conn = sqlite3.connect('splitit.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute("UPDATE users SET password = ?, name = ? WHERE email = ?", (hashed_pw, name, email))
            print(f"Updated existing admin user: {email}")
        else:
            cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_pw))
            print(f"Created new admin user: {email}")
            
        conn.commit()
        conn.close()
        
        print("\n--- ADMIN CREDENTIALS ---")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print("--------------------------")
        
    except Exception as e:
        print(f"Error seeding admin: {e}")

if __name__ == "__main__":
    seed_admin()
