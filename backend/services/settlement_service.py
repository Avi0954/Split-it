from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from backend.models.settlement import Settlement
from backend.models.expense import Expense, Split
from backend.models.group import GroupMember
from backend.services.expense_service import calculate_group_balances
from backend.schemas.settlement import SimplifiedSettlement, SettlementCreate
from backend.utils.currency import convert_currency
from backend.services.realtime_service import realtime_service

def calculate_optimized_settlements(db: Session, group_id: int):
    """
    Calculates the minimum number of transactions to settle all debts in a group.
    Uses a Greedy Algorithm:
    1. Get current net balances (Expenses - Splits).
    2. Adjust for already recorded Settlements.
    3. Match largest debtors with largest creditors.
    """
    # 1. Get base balances from expenses
    base_balances = calculate_group_balances(db, group_id)
    
    # 2. Adjust for existing settlements
    # Adjustment = Settlements Paid - Settlements Received
    final_balances = []
    for b in base_balances:
        # Settlements where this user paid (Normalized to INR)
        paid_settlements = db.query(Settlement).filter(
            Settlement.group_id == group_id,
            Settlement.from_user_id == b.user_id
        ).all()
        total_paid_inr = sum(convert_currency(s.amount, getattr(s, 'currency', 'INR') or 'INR', "INR") for s in paid_settlements)
        
        # Settlements where this user received money (Normalized to INR)
        received_settlements = db.query(Settlement).filter(
            Settlement.group_id == group_id,
            Settlement.to_user_id == b.user_id
        ).all()
        total_received_inr = sum(convert_currency(s.amount, getattr(s, 'currency', 'INR') or 'INR', "INR") for s in received_settlements)
        
        adjusted_balance = b.net_balance + total_paid_inr - total_received_inr
        
        # We'll use a dict for the algorithm
        final_balances.append({
            "user_id": b.user_id,
            "user_name": b.user_name,
            "balance": round(adjusted_balance, 2)
        })

    # 3. Separate into debtors and creditors
    debtors = [u for u in final_balances if u["balance"] < -0.01]
    creditors = [u for u in final_balances if u["balance"] > 0.01]
    
    # Sort: debtors ascending (most negative first), creditors descending (most positive first)
    debtors.sort(key=lambda x: x["balance"])
    creditors.sort(key=lambda x: x["balance"], reverse=True)
    
    settlements = []
    
    # 4. Greedy match
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]
        
        amount = min(-debtor["balance"], creditor["balance"])
        
        if amount > 0:
            settlements.append(SimplifiedSettlement(
                from_user_id=debtor["user_id"],
                from_user_name=debtor["user_name"],
                to_user_id=creditor["user_id"],
                to_user_name=creditor["user_name"],
                amount=round(amount, 2),
                currency="INR"
            ))
            
            debtor["balance"] += amount
            creditor["balance"] -= amount
            
        if abs(debtor["balance"]) < 0.01:
            i += 1
        if abs(creditor["balance"]) < 0.01:
            j += 1
            
    return settlements

def record_settlement(db: Session, settlement_data: SettlementCreate):
    """Records a payment between two users to settle debt."""
    new_settlement = Settlement(
        group_id=settlement_data.group_id,
        from_user_id=settlement_data.from_user_id,
        to_user_id=settlement_data.to_user_id,
        amount=settlement_data.amount,
        currency=settlement_data.currency,
        status="paid"
    )
    db.add(new_settlement)
    db.commit()
    db.refresh(new_settlement)
    
    # Broadcast event
    settlement_dict = {
        "id": new_settlement.id,
        "amount": new_settlement.amount,
        "from_user_id": new_settlement.from_user_id,
        "to_user_id": new_settlement.to_user_id
    }
    realtime_service.broadcast_settlement_created(db, settlement_data.group_id, settlement_dict)
    
    return new_settlement
