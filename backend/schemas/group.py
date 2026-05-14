from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

class UserBasic(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    currency: Optional[str] = "INR"

class AddMember(BaseModel):
    user_id: int

class GroupResponse(BaseModel):
    id: int
    name: str
    created_by: int
    created_at: datetime
    description: Optional[str] = None
    avatar: Optional[str] = None
    currency: Optional[str] = "INR"
    members_count: int = 1
    user_balance: float = 0.0
    last_activity: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GroupMemberResponse(BaseModel):
    id: int
    user: UserBasic

    model_config = ConfigDict(from_attributes=True)

class GroupDetail(BaseModel):
    id: int
    name: str
    created_by: int
    created_at: datetime
    description: Optional[str] = None
    avatar: Optional[str] = None
    currency: Optional[str] = "INR"
    members: List[GroupMemberResponse]

    model_config = ConfigDict(from_attributes=True)