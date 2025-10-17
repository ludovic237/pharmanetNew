# app/models/fabriquant.py

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base


class Fabriquant(Base):
  __tablename__ = "fabriquant"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  adresse = Column(String(32))
  telephone = Column(String(32))
  email = Column(String(32))
  codepostal = Column(String(20))
  supprimer = Column(Integer, default=0)


# -------- Pydantic V2 --------
class FabriquantBaseSchema(BaseModel):
  # code: Optional[str]
  nom: str
  # nom: Optional[str]
  # adresse: Optional[str]
  # telephone: Optional[str]
  # email: Optional[str]
  # codepostal: Optional[str]
  # supprimer: Optional[int]

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}

class FabriquantCreateSchema(FabriquantBaseSchema):
  pass

class FabriquantSchema(FabriquantBaseSchema):
  id: int
  code: str
  nom: str
  adresse: str
  telephone: str
  email: str
  codepostal: str
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}

# Schéma d'ENTRÉE (pour les bodies POST/PUT)
class FabriquantIn(BaseModel):
  code: str
  nom: str
  adresse: str
  telephone: str
  email: str
  codepostal: str
