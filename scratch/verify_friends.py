import requests
import json

base_url = "http://localhost:8000"

def login(email, password):
    r = requests.post(f"{base_url}/auth/login", data={"username": email, "password": password})
    if r.status_code != 200:
        print(f"Login failed for {email}: {r.status_code} - {r.text}")
        return None
    return r.json()["access_token"]

def main():
    # 1. Login as test@example.com
    print("Logging in as test@example.com...")
    token1 = login("test@example.com", "password123")
    if not token1: return
    headers1 = {"Authorization": f"Bearer {token1}"}

    # 2. Login as admin@example.com (or someone else)
    print("Logging in as admin@example.com...")
    token2 = login("admin@example.com", "admin123")
    if not token2: return
    
    # 3. Add admin@example.com as a friend to test@example.com
    print("Adding admin@example.com as a friend...")
    r = requests.post(f"{base_url}/friends/", json={"email": "admin@example.com"}, headers=headers1)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
    
    if r.status_code in [201, 400]:
        # 4. Get friends list
        print("Fetching friends list...")
        r2 = requests.get(f"{base_url}/friends/", headers=headers1)
        print(f"Status: {r2.status_code}")
        print(f"Response: {json.dumps(r2.json(), indent=2)}")

if __name__ == "__main__":
    main()
