from pydantic import BaseModel
from typing import Dict

class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: SubscriptionKeys

class PushSubscriptionOut(BaseModel):
    id: int
    endpoint: str

    class Config:
        from_attributes = True
