from fastapi import Request, HTTPException, status
import time
from typing import Dict, List

# In-memory stores for rate limiting (Note: in production across multiple workers, use Redis)
ip_requests: Dict[str, List[float]] = {}
email_requests: Dict[str, List[float]] = {}
auth_ip_requests: Dict[str, List[float]] = {}

def rate_limit_auth(request: Request, limit: int = 10, window: int = 300):
    """
    Rate limiting for general auth routes (login, register):
    - Default 10 requests per 5 minutes per IP
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    window_start = current_time - window
    
    if client_ip not in auth_ip_requests:
        auth_ip_requests[client_ip] = []
        
    auth_ip_requests[client_ip] = [req_time for req_time in auth_ip_requests[client_ip] if req_time > window_start]
    
    if len(auth_ip_requests[client_ip]) >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again later."
        )
        
    auth_ip_requests[client_ip].append(current_time)

def rate_limit_forgot_password(request: Request):
    """
    Rate limiting for forgot password route:
    - 5 per IP per hour
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    one_hour_ago = current_time - 3600
    
    if client_ip not in ip_requests:
        ip_requests[client_ip] = []
        
    ip_requests[client_ip] = [req_time for req_time in ip_requests[client_ip] if req_time > one_hour_ago]
    
    if len(ip_requests[client_ip]) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests from this IP. Please try again later."
        )
        
    ip_requests[client_ip].append(current_time)
    
def check_email_rate_limit(email: str):
    """
    Validates if a specific email has requested a reset too many times.
    """
    current_time = time.time()
    one_hour_ago = current_time - 3600
    
    if email not in email_requests:
        email_requests[email] = []
        
    email_requests[email] = [req_time for req_time in email_requests[email] if req_time > one_hour_ago]
    
    if len(email_requests[email]) >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests for this email. Please try again later."
        )
        
    email_requests[email].append(current_time)

