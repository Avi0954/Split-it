from pydantic import BaseModel, ConfigDict, field_validator
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
    icon_name: Optional[str] = "Users"
    icon_color: Optional[str] = "#3B82F6"

    @field_validator('icon_name')
    @classmethod
    def validate_icon_name(cls, v):
        allowed_icons = {
            'Users', 'Plane', 'Home', 'Briefcase', 'Car', 'Wallet', 'ShoppingCart', 
            'Utensils', 'Coffee', 'Gift', 'Gamepad2', 'Book', 'GraduationCap', 
            'Heart', 'Building', 'Camera', 'Music', 'Train', 'Bus', 'Bike', 
            'Mountain', 'Tent', 'Map', 'Hotel', 'Pizza', 'DollarSign', 
            'CreditCard', 'PiggyBank', 'Globe', 'Ship'
        }
        if v and v not in allowed_icons:
            raise ValueError(f"Invalid icon_name. Allowed values are: {', '.join(allowed_icons)}")
        return v

    @field_validator('icon_color')
    @classmethod
    def validate_icon_color(cls, v):
        allowed_colors = {
            '#3B82F6', '#10B981', '#A78BFA', '#F97316', '#EC4899', 
            '#EF4444', '#EAB308', '#6B7280', '#14B8A6', '#6366F1'
        }
        if v and v.upper() not in allowed_colors:
            raise ValueError(f"Invalid icon_color. Allowed values are: {', '.join(allowed_colors)}")
        return v.upper() if v else v

class AddMember(BaseModel):
    user_id: int

class GroupResponse(BaseModel):
    id: int
    name: str
    created_by: int
    created_at: datetime
    description: Optional[str] = None
    icon_name: Optional[str] = "Users"
    icon_color: Optional[str] = "#3B82F6"
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
    icon_name: Optional[str] = "Users"
    icon_color: Optional[str] = "#3B82F6"
    currency: Optional[str] = "INR"
    members: List[GroupMemberResponse]

    model_config = ConfigDict(from_attributes=True)