from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Fabriquant(Base):
  __tablename__ = "fabriquant"

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  adresse = Column(String(32))
  telephone = Column(String(32))
  email = Column(String(32))
  codepostal = Column(String(20))
  supprimer = Column(Integer, default=0)
