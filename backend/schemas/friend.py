from pydantic import BaseModel, ConfigDict, EmailStr
from backend.schemas.user import UserResponse

class AddFriendRequest(BaseModel):
    email: EmailStr

class FriendResponse(BaseModel):
    id: int # Friendship ID
    friend: UserResponse
    group_id: int # The hidden group for this 1-on-1
    balance: float = 0.0 # Outstanding balance with this friend

    model_config = ConfigDict(from_attributes=True)
