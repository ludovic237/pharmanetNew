from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class ProduitDetail(Base):
  __tablename__ = "produit_detail"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  reference = Column(String(32))
  nom = Column(String(50), nullable=False)
  stock = Column(Integer, nullable=False)
  stock_max = Column(Integer, nullable=False)
  stock_min = Column(Integer, nullable=False)
  reduction_max = Column(Integer, default=0, nullable=False)
  prix = Column(Integer, nullable=False)
  grossiste_list = Column(String(100), nullable=False)
  supprimer = Column(Integer, default=0, nullable=False)
