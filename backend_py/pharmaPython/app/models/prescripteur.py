from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class Prescripteur(Base):
  __tablename__ = "prescripteur"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String)
  structure = Column(String)
  adresse = Column(String)
  telephone = Column(String)
  supprimer = Column(Integer, default=0)


class PrescripteurSchema(BaseModel):
  id: int
  nom: str
  structure: str
  adresse: str
  telephone: str
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}


# Schéma d'ENTRÉE (pour les bodies POST/PUT)
class PrescripteurIn(BaseModel):
  nom: str
  structure: str
  adresse: str
  telephone: str
