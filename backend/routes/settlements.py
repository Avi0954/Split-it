from typing import List
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from backend.schemas.settlement import SettlementCreate, SettlementResponse, SimplifiedSettlement
from backend.utils.dependencies import get_db, get_current_user
from backend.models.user import User
from backend.services.settlement_service import calculate_optimized_settlements, record_settlement

router = APIRouter()

@router.get("/groups/{group_id}/settlements", response_model=List[SimplifiedSettlement])
def get_group_settlements(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Calculates the minimum transactions needed to settle all debts in a group."""
    return calculate_optimized_settlements(db, group_id)

@router.post("/settlements/pay", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
def pay_debt(settlement_data: SettlementCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Records a payment between two users to settle debt."""
    return record_settlement(db, settlement_data, background_tasks, current_user.name)
