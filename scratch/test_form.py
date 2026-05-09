
import requests
from backend.database import SessionLocal
from backend.models.user import User
from backend.utils.security import create_access_token

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No users found.")
else:
    token = create_access_token(data={"sub": user.email})
    url = "http://localhost:8000/groups/"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"name": "Test Form", "description": "Desc"}
    
    # Using data= for form fields, which sends application/x-www-form-urlencoded
    # And we'll also test multipart with a file
    response = requests.post(url, headers=headers, data=data)
    print("Form-urlencoded Response:")
    print(response.status_code)
    print(response.text)

db.close()
