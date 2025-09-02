from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Ville(Base):
  __tablename__ = "ville"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String(32), nullable=False)
  code = Column(String(16))
  supprimer = Column(Integer, default=0)
