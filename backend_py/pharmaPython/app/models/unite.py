from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class Unite(Base):
  __tablename__ = "unite"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String(16))
  libelle = Column(String(32))
  supprimer = Column(Integer, default=0)
