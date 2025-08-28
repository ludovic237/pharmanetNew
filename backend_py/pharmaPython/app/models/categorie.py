from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Categorie(Base):
  __tablename__ = "categorie"

  id = Column(Integer, primary_key=True, index=True)
  nom = Column(String(32), nullable=False)
  supprimer = Column(Integer, default=0)
