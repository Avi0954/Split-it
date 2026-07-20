import os

APP_NAME = os.getenv("APP_NAME", "SplitIt")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", "support@splitit.com")

def _get_base_html(content: str) -> str:
    """Provides a consistent, responsive, dark-mode friendly HTML shell."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{APP_NAME}</title>
        <style>
            body {{ font-family: 'Inter', Arial, sans-serif; background-color: #09090B; color: #EAEAF0; margin: 0; padding: 20px; text-align: center; line-height: 1.5; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #12121A; padding: 40px; border-radius: 16px; border: 1px solid #1F1F2B; text-align: left; }}
            .header {{ text-align: center; margin-bottom: 32px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #EAEAF0; text-decoration: none; }}
            .logo span {{ color: #A78BFA; }}
            h1 {{ font-size: 22px; font-weight: 600; margin-bottom: 16px; margin-top: 0; color: #EAEAF0; text-align: center; }}
            p {{ color: #A1A1AA; font-size: 15px; margin-bottom: 24px; }}
            .btn-container {{ text-align: center; margin: 32px 0; }}
            .btn {{ display: inline-block; background-color: #A78BFA; color: #000000; padding: 14px 28px; font-weight: 600; font-size: 15px; text-decoration: none; border-radius: 10px; }}
            .footer {{ margin-top: 40px; padding-top: 24px; border-top: 1px solid #1F1F2B; font-size: 13px; color: #52525B; text-align: center; }}
            .footer a {{ color: #A78BFA; text-decoration: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <a href="#" class="logo">Split<span>It</span></a>
            </div>
            
            {content}
            
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a></p>
                <p>&copy; {APP_NAME}. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_welcome_email(user_name: str, login_url: str):
    html = f"""
    <h1>Welcome to {APP_NAME}, {user_name}!</h1>
    <p>We're thrilled to have you on board. {APP_NAME} is the simplest way to track your shared expenses, balances, and settle up with friends hassle-free.</p>
    <p>You can now start creating groups, adding expenses, and letting our intelligent settlement engine do the math for you.</p>
    <div class="btn-container">
        <a href="{login_url}" class="btn">Go to Dashboard</a>
    </div>
    """
    
    plain = f"""
    Welcome to {APP_NAME}, {user_name}!
    
    We're thrilled to have you on board. {APP_NAME} is the simplest way to track your shared expenses.
    
    Go to your dashboard: {login_url}
    
    Need help? Contact {SUPPORT_EMAIL}
    """
    
    return _get_base_html(html), plain

def get_password_reset_email(reset_url: str):
    html = f"""
    <h1>Reset Your Password</h1>
    <p>Hello,</p>
    <p>We received a request to reset your {APP_NAME} password. Click the button below to choose a new password.</p>
    <div class="btn-container">
        <a href="{reset_url}" class="btn">Reset Password</a>
    </div>
    <p><strong>This link expires in 15 minutes.</strong></p>
    <p>If you didn't request this, simply ignore this email and your password will remain unchanged.</p>
    """
    
    plain = f"""
    Reset Your Password
    
    Hello,
    
    We received a request to reset your {APP_NAME} password. 
    
    Click the link below to choose a new password:
    {reset_url}
    
    This link expires in 15 minutes. If you didn't request this, simply ignore this email.
    
    Need help? Contact {SUPPORT_EMAIL}
    """
    
    return _get_base_html(html), plain

def get_group_invitation_email(group_name: str, inviter_name: str, group_url: str):
    html = f"""
    <h1>You've been invited!</h1>
    <p>Hello,</p>
    <p><strong>{inviter_name}</strong> has invited you to join the group <strong>"{group_name}"</strong> on {APP_NAME}.</p>
    <p>Join the group to start tracking shared expenses and easily settle up with everyone.</p>
    <div class="btn-container">
        <a href="{group_url}" class="btn">Open Group</a>
    </div>
    <p>If you don't have an account yet, you'll be prompted to create one first.</p>
    """
    
    plain = f"""
    You've been invited!
    
    Hello,
    
    {inviter_name} has invited you to join the group "{group_name}" on {APP_NAME}.
    
    Join the group to start tracking shared expenses:
    {group_url}
    
    Need help? Contact {SUPPORT_EMAIL}
    """
    
    return _get_base_html(html), plain

def get_friend_invitation_email(inviter_name: str, accept_url: str):
    html = f"""
    <h1>New Friend Request</h1>
    <p>Hello,</p>
    <p><strong>{inviter_name}</strong> wants to connect with you on {APP_NAME}!</p>
    <p>Connecting with friends allows you to track individual expenses outside of groups easily.</p>
    <div class="btn-container">
        <a href="{accept_url}" class="btn">View Request</a>
    </div>
    <p>If you don't have an account yet, you'll be prompted to create one first.</p>
    """
    
    plain = f"""
    New Friend Request
    
    Hello,
    
    {inviter_name} wants to connect with you on {APP_NAME}!
    
    View the request here:
    {accept_url}
    
    Need help? Contact {SUPPORT_EMAIL}
    """
    
    return _get_base_html(html), plain
