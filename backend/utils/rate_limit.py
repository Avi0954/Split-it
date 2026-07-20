from fastapi import Request, HTTPException, status
import time
from typing import Dict, List

# In-memory stores for rate limiting (Note: in production across multiple workers, use Redis)
ip_requests: Dict[str, List[float]] = {}
email_requests: Dict[str, List[float]] = {}

def rate_limit_forgot_password(request: Request):
    """
    Rate limiting for forgot password route:
    - 5 per IP per hour
    - 3 per email per hour
    """
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    one_hour_ago = current_time - 3600
    
    # 1. Check IP limits
    if client_ip not in ip_requests:
        ip_requests[client_ip] = []
        
    # Clean up old requests
    ip_requests[client_ip] = [req_time for req_time in ip_requests[client_ip] if req_time > one_hour_ago]
    
    if len(ip_requests[client_ip]) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests from this IP. Please try again later."
        )
        
    # We add the IP request count here, but we will add the email count inside the route itself
    # since we need to read the body to get the email.
    ip_requests[client_ip].append(current_time)
    
def check_email_rate_limit(email: str):
    """
    Validates if a specific email has requested a reset too many times.
    """
    current_time = time.time()
    one_hour_ago = current_time - 3600
    
    if email not in email_requests:
        email_requests[email] = []
        
    # Clean up old requests
    email_requests[email] = [req_time for req_time in email_requests[email] if req_time > one_hour_ago]
    
    if len(email_requests[email]) >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests for this email. Please try again later."
        )
        
    email_requests[email].append(current_time)
