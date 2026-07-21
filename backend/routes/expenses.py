from typing import List
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from backend.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseDetail, UserBalance
from backend.utils.dependencies import get_db, get_current_user
from backend.models.user import User
from backend.services.expense_service import create_expense, get_group_expenses, calculate_group_balances

router = APIRouter()

@router.post("/{group_id}/expenses", response_model=ExpenseDetail, status_code=status.HTTP_201_CREATED)
def add_new_expense(group_id: int, expense_data: ExpenseCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Adds a new expense to a group. Payer and split members must belong to group."""
    return create_expense(db, group_id, expense_data, background_tasks, current_user.name)

@router.get("/{group_id}/expenses", response_model=List[ExpenseDetail])
def list_group_expenses(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lists all expenses and their splits in a group."""
    return get_group_expenses(db, group_id)

@router.get("/{group_id}/balances", response_model=List[UserBalance])
def get_group_balances(group_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Calculates each user's net balance within the group."""
    return calculate_group_balances(db, group_id)

from backend.services.expense_service import update_expense, delete_expense

@router.put("/{group_id}/expenses/{expense_id}", response_model=ExpenseDetail)
def modify_expense(group_id: int, expense_id: int, expense_data: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Updates an existing expense and its splits."""
    return update_expense(db, group_id, expense_id, expense_data, current_user.id)

@router.delete("/{group_id}/expenses/{expense_id}")
def remove_expense(group_id: int, expense_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Deletes an expense from the group."""
    return delete_expense(db, group_id, expense_id, current_user.id)
