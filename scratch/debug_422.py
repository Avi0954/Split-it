
from backend.database import SessionLocal
from backend.models.user import User
from backend.utils.security import create_access_token
import requests

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No users found.")
else:
    token = create_access_token(data={"sub": user.email})
    print(f"Testing with user: {user.email}")
    
    # Test Multipart Form Data (like the frontend does)
    url = "http://localhost:8000/groups/"
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "name": (None, "Test Group from Script"),
        "description": (None, "This is a test description")
    }
    # Note: requests sends multipart if files is provided
    # For Form fields without files, we can use 'data' or 'files' with None for filename
    
    response = requests.post(url, headers=headers, files=files)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
db.close()
