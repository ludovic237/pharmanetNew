from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Categorie(BaseModel):
  id: int
  nom: str
  supprimer: Optional[int] = 0

# Pydantic v2 (remplace orm_mode=True)
model_config = {"from_attributes": True}
