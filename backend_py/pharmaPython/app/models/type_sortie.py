from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.api.v1.db import Base

class TypeSortie(Base):
  __tablename__ = "type_sortie"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String(100))
  description = Column(String)
  supprimer = Column(Integer, default=0)


class TypeSortieSchema(BaseModel):
  id: int
  nom: str
  description: str
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}


# Schéma d'ENTRÉE (pour les bodies POST/PUT)
class TypeSortieIn(BaseModel):
  nom: str
  description: str
