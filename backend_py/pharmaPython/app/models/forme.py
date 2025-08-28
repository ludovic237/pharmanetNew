from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Forme(Base):
  __tablename__ = "forme"

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  supprimer = Column(Integer, default=0)
