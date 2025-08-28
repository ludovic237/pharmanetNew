from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Rayon(Base):
  __tablename__ = "rayon"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32), nullable=False)
  supprimer = Column(Integer, default=0)

class RayonSchema(BaseModel):
  id: int
  code: str
  nom: str
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}


# Schéma d'ENTRÉE (pour les bodies POST/PUT)
class RayonIn(BaseModel):
  code: str
  nom: str
