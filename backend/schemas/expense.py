from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SplitBase(BaseModel):
    user_id: int
    amount_owed: float

class SplitCreate(SplitBase):
    pass

class SplitResponse(SplitBase):
    id: int
    
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    description: str
    amount: float
    currency: Optional[str] = "INR"
    payer_id: int

class ExpenseCreate(ExpenseBase):
    splits: List[SplitCreate]

class ExpenseResponse(ExpenseBase):
    id: int
    group_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseDetail(ExpenseResponse):
    splits: List[SplitResponse]

class UserBalance(BaseModel):
    user_id: int
    user_name: str
    net_balance: float
