from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, default="paid") # For now, we'll assume settlements are 'paid' when recorded
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    group = relationship("Group", backref="settlements")
    from_user = relationship("User", foreign_keys=[from_user_id], backref="settlements_sent")
    to_user = relationship("User", foreign_keys=[to_user_id], backref="settlements_received")
