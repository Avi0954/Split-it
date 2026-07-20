import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'splitit.db')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(groups)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "icon_name" not in columns:
        print("Adding icon_name column to groups table...")
        cursor.execute("ALTER TABLE groups ADD COLUMN icon_name VARCHAR DEFAULT 'Users'")
        
    if "icon_color" not in columns:
        print("Adding icon_color column to groups table...")
        cursor.execute("ALTER TABLE groups ADD COLUMN icon_color VARCHAR DEFAULT '#3B82F6'")
        
    # Update existing rows if they had an avatar
    if "avatar" in columns:
        print("Migrating avatar data...")
        cursor.execute("UPDATE groups SET icon_name = 'Users', icon_color = '#3B82F6' WHERE avatar IS NOT NULL")
        
        # Note: SQLite doesn't support DROP COLUMN easily before 3.35.0. 
        # We'll just leave the avatar column there, it's ignored by SQLAlchemy since we removed it from the model.
        
    conn.commit()
    conn.close()
    print("Migration complete.")
else:
    print("Database not found, nothing to migrate.")
