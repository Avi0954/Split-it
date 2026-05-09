import os
import bcrypt
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt

# Security Configuration
# In production, use environment variables for SECRET_KEY
SECRET_KEY = os.getenv("SECRET_KEY", "7b04519962a74c2e6f4770258416d610df666138be73a901844b20")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    """Returns the hashed version of a plain text password using bcrypt."""
    # Salt is auto-generated and included in the hashed password
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its hashed version."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """Creates a JWT access token with user data and expiry time."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decodes a JWT access token and returns the data."""
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Return none if expired
        if decoded_token.get("exp") and decoded_token["exp"] < datetime.utcnow().timestamp():
            return None
        return decoded_token
    except Exception:
        return None
