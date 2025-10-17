from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class Budget(Base):
  __tablename__ = "budget"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  nom = Column(String(32), nullable=False)
  prenom = Column(String(32), nullable=False)
  montant = Column(Integer, nullable=False)
