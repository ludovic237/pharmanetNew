from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Rayon(Base):
  __tablename__ = "rayon"

  id = Column(Integer, primary_key=True, index=True)
  code = Column(String(16), nullable=False)
  nom = Column(String(32), nullable=False)
  supprimer = Column(Integer, default=0)
