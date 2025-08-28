from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Prescripteur(Base):
  __tablename__ = "prescripteur"

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String)
  structure = Column(String)
  adresse = Column(String)
  telephone = Column(String)
  supprimer = Column(Integer, default=0)
