from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.utils.dependencies import get_db, get_current_user
from backend.services.settlement_service import calculate_optimized_settlements
from backend.utils.currency import convert_currency

router = APIRouter()

@router.get("/")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregates financial data across all groups the user is a member of.
    Calculates total owed, total owing, and net balance.
    """
    total_owed = 0.0  # Money others owe to the current_user
    total_owing = 0.0 # Money the current_user owes to others

    # Fetch all groups user is in
    for membership in current_user.group_memberships:
        group_id = membership.group_id
        
        # We reuse the optimized settlements algorithm to get accurate pending debts
        settlements = calculate_optimized_settlements(db, group_id)
        
        for s in settlements:
            if s.to_user_id == current_user.id:
                # Someone is paying the current user
                total_owed += s.amount
            elif s.from_user_id == current_user.id:
                # Current user is paying someone
                total_owing += s.amount

    # Calculate total spending by category (currently using groups as categories)
    spending_by_category = {}
    total_spending_inr = 0.0

    # Fetch expenses paid by current user
    for membership in current_user.group_memberships:
        group = membership.group
        group_spending_inr = 0.0
        for expense in group.expenses:
            if expense.payer_id == current_user.id:
                amount_inr = convert_currency(expense.amount, expense.currency, "INR")
                group_spending_inr += amount_inr
                total_spending_inr += amount_inr
        
        if group_spending_inr > 0:
            spending_by_category[group.name] = round(group_spending_inr, 2)

    return {
        "total_balance": round(total_owed - total_owing, 2),
        "total_owed": round(total_owed, 2),
        "total_owing": round(total_owing, 2),
        "total_groups": len(current_user.group_memberships),
        "total_spending": round(total_spending_inr, 2),
        "spending_by_category": spending_by_category
    }
