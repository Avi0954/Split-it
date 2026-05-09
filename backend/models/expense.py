from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    payer = relationship("User", backref="expenses_paid")
    group = relationship("Group", backref="expenses")
    splits = relationship("Split", back_populates="expense", cascade="all, delete-orphan")

class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_owed = Column(Float, nullable=False)

    # Relationships
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", backref="splits_owed")
