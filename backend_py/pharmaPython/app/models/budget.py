from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Budget(Base):
  __tablename__ = "budget"

  id = Column(Integer, primary_key=True, index=True)
  nom = Column(String(32), nullable=False)
  prenom = Column(String(32), nullable=False)
  montant = Column(Integer, nullable=False)
