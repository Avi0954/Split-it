from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # Relationships
    # Groups created by this user
    groups_created = relationship("Group", back_populates="creator")
    
    # Groups this user is a member of (via GroupMember table)
    group_memberships = relationship("GroupMember", back_populates="user")
    
    # 1-to-1 User Settings
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)

    # Password reset tokens
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

