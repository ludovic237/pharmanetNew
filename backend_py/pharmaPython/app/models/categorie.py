# app/models/categorie.py
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Categorie(Base):
  __tablename__ = "categorie"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  nom = Column(String)              # <-- évite default=0.0 (mauvais type)
  supprimer = Column(Integer, default=0)

class CategorieCreateSchema(BaseModel):
  nom: str
  supprimer: Optional[int] = 0
  model_config = {"from_attributes": True}

class CategorieSchema(BaseModel):
  id: int
  nom: str
  supprimer: int | None = 0
  model_config = {"from_attributes": True}
