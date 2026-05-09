from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models.user import User
from backend.models.group import Group, GroupMember
from backend.models.expense import Expense, Split
from backend.services.group_service import create_group, add_member
from backend.services.expense_service import create_expense
from backend.services.settlement_service import calculate_optimized_settlements
from backend.schemas.group import GroupCreate
from backend.schemas.expense import ExpenseCreate, SplitCreate
import os

# Use an in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_settle_splitit.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_settlement_logic():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # 1. Create Users
        u1 = User(name="Alice", email="alice@example.com", password="hash")
        u2 = User(name="Bob", email="bob@example.com", password="hash")
        u3 = User(name="Charlie", email="charlie@example.com", password="hash")
        db.add_all([u1, u2, u3])
        db.commit()
        for u in [u1, u2, u3]: db.refresh(u)
        
        print(f"Created Users: Alice(1), Bob(2), Charlie(3)")
        
        # 2. Create Group
        group = create_group(db, u1.id, GroupCreate(name="Optimization Test"))
        add_member(db, group.id, u2.id)
        add_member(db, group.id, u3.id)
        
        # Scenario: 
        # Alice pays $20 for Lunch (All three split equal: 6.67 each approx)
        # Bob pays $10 for Snacks (All three split equal)
        # Total = 30. Each owes 10.
        # Alice should have paid 10, but paid 20. Net +10.
        # Bob should have paid 10, and paid 10. Net 0.
        # Charlie should have paid 10, but paid 0. Net -10.
        
        # Add Lunch
        create_expense(db, group.id, ExpenseCreate(
            description="Lunch", amount=21.0, payer_id=u1.id, # Using 21 for easy math ($7 each)
            splits=[
                SplitCreate(user_id=u1.id, amount_owed=7.0),
                SplitCreate(user_id=u2.id, amount_owed=7.0),
                SplitCreate(user_id=u3.id, amount_owed=7.0)
            ]
        ))
        
        # Add Snacks
        create_expense(db, group.id, ExpenseCreate(
            description="Snacks", amount=9.0, payer_id=u2.id, # Using 9 for easy math ($3 each)
            splits=[
                SplitCreate(user_id=u1.id, amount_owed=3.0),
                SplitCreate(user_id=u2.id, amount_owed=3.0),
                SplitCreate(user_id=u3.id, amount_owed=3.0)
            ]
        ))
        
        # Theoretical Balances:
        # Alice: Paid 21, Owed (7+3=10). Bal = +11.
        # Bob:   Paid 9,  Owed (7+3=10). Bal = -1.
        # Charlie: Paid 0, Owed (7+3=10). Bal = -10.
        
        settlements = calculate_optimized_settlements(db, group.id)
        
        print("\nOptimized Settlements:")
        for s in settlements:
            print(f"{s.from_user_name} -> {s.to_user_name}: ${s.amount}")
            
        # Optimization check:
        # Charlie owes 10. Bob owes 1. Alice is owed 11.
        # Charlie -> Alice ($10)
        # Bob -> Alice ($1)
        # Total transactions: 2 (Minimal)
        
        expected_settlements = 2
        if len(settlements) == expected_settlements:
            print("\n✅ Optimization Successful! (2 transactions)")
        else:
            print(f"\n❌ Optimization Failed! Found {len(settlements)} transactions.")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_settlement_logic()
