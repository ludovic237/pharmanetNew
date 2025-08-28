from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Magasin(Base):
  __tablename__ = "magasin"

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32), nullable=False)
  supprimer = Column(Integer, default=0)
