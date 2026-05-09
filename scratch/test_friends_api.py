import os
import sys

# Ensure backend can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal
from backend.models.user import User
from backend.models.friendship import Friendship
from backend.services.group_service import get_group_balances
from sqlalchemy import or_

def test():
    db = SessionLocal()
    try:
        # Just pick the first user
        current_user = db.query(User).first()
        if not current_user:
            print("No users found")
            return
        
        print(f"Testing for user: {current_user.email}")
        
        friendships = db.query(Friendship).filter(
            or_(Friendship.user1_id == current_user.id, Friendship.user2_id == current_user.id)
        ).all()
        
        print(f"Found {len(friendships)} friendships")
        
        result = []
        for f in friendships:
            friend_id = f.user2_id if f.user1_id == current_user.id else f.user1_id
            friend_user = db.query(User).filter(User.id == friend_id).first()
            
            # Calculate balance
            try:
                balances = get_group_balances(db, f.group_id)
                balance = 0.0
                for debt in balances['simplified_debts']:
                    if debt['from'] == current_user.id and debt['to'] == friend_id:
                        balance = -debt['amount'] # Current user owes friend
                    elif debt['from'] == friend_id and debt['to'] == current_user.id:
                        balance = debt['amount'] # Friend owes current user
                        
            except Exception as e:
                print(f"Error calculating balance: {e}")
                balance = 0.0

            print(f"Friend: {friend_user.email}, Group: {f.group_id}, Balance: {balance}")
            
            result.append({
                "id": f.id,
                "friend": friend_user,
                "group_id": f.group_id,
                "balance": balance
            })
            
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test()
