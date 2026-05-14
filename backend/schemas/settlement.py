from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SettlementBase(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: float
    currency: Optional[str] = "INR"

class SettlementCreate(SettlementBase):
    group_id: int

class SettlementResponse(SettlementBase):
    id: int
    group_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class SimplifiedSettlement(SettlementBase):
    # This is for the greedy algorithm output
    from_user_name: str
    to_user_name: str
