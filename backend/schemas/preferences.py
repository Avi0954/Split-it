from pydantic import BaseModel
from typing import Optional

class PreferencesUpdate(BaseModel):
    push_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    new_expenses_alerts: Optional[bool] = None
    settlement_alerts: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    region: Optional[str] = None
    currency: Optional[str] = None
    public_profile_visibility: Optional[bool] = None
    activity_status: Optional[bool] = None
    data_collection: Optional[bool] = None

class PreferencesResponse(BaseModel):
    id: int
    user_id: int
    push_notifications: bool
    email_notifications: bool
    new_expenses_alerts: bool
    settlement_alerts: bool
    theme: str
    language: str
    region: str
    currency: str
    public_profile_visibility: bool
    activity_status: bool
    data_collection: bool

    class Config:
        from_attributes = True
