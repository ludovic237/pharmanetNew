from sqlalchemy import Column, Integer, String
from app.core.db import Base

class TypeDepense(Base):
  __tablename__ = "type_depense"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String(100))
  description = Column(String)
  supprimer = Column(Integer, default=0)
