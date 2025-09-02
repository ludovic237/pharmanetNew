from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class History(Base):
  __tablename__ = "history"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  produit_id = Column(Integer, ForeignKey("produit.id"))
  produit = relationship("Produit", lazy="select")
  user_id = Column(Integer, ForeignKey("user.id"))
  user = relationship("User", lazy="select")
  date_histo = Column(DateTime)
  description = Column(String(64))
  quantite = Column(Integer, nullable=False)
  type_histo = Column(String(64), nullable=False)
