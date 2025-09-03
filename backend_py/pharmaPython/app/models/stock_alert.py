from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.db import Base

class StockAlert(Base):
  __tablename__ = "stock_alert"
  id = Column(Integer, primary_key=True, index=True)
  produit_id = Column(Integer, ForeignKey("produit.id"), nullable=False, index=True)
  type = Column(String(50), nullable=False)  # 'LOW_STOCK' | 'BELOW_ROP' | 'OOS_RISK'
  message = Column(String(512), nullable=False)
  severity = Column(String(20), nullable=False)  # 'critical' | 'warning' | 'info'
  stock = Column(Integer, nullable=False, default=0)
  rop = Column(Float, nullable=True)
  days_left = Column(Float, nullable=True)
  status = Column(String(20), nullable=False, default="OPEN")  # OPEN | ACK | CLOSED
  created_at = Column(DateTime(timezone=True), server_default=func.now())
  updated_at = Column(DateTime(timezone=True), onupdate=func.now())

  produit = relationship("Produit")

  __table_args__ = (
    UniqueConstraint("produit_id", "type", "status",
                     name="uq_alert_produit_type_status"),
  )

class StockAlertSchema(BaseModel):
  id: int
  produit_id: int
  type: str
  message: str
  severity: str
  stock: int
  rop: float | None = None
  days_left: float | None = None
  status: str
  created_at: datetime

  model_config = {"from_attributes": True}
