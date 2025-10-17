from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.api.v1.db import Base

class Transaction(Base):
  __tablename__ = "transaction"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  user_id = Column(Integer, ForeignKey("user.id"))
  montant = Column(Float, default=0.0)
  type = Column(String(32))
  note = Column(String(128))
  date_transac = Column(DateTime)

  user = relationship("User")
