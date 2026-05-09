from sqlalchemy import Column, Integer, Boolean, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Notifications
    push_notifications = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=False)
    new_expenses_alerts = Column(Boolean, default=True)
    settlement_alerts = Column(Boolean, default=True)

    # Appearance & Locale
    theme = Column(String, default="dark")
    language = Column(String, default="English (US)")
    region = Column(String, default="India")
    currency = Column(String, default="INR")

    # Privacy
    public_profile_visibility = Column(Boolean, default=True)
    activity_status = Column(Boolean, default=True)
    data_collection = Column(Boolean, default=False)

    # Relationship
    user = relationship("User", back_populates="preferences")
