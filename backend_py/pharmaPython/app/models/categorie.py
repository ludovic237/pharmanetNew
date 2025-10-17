# app/models/categorie.py
from sqlalchemy.orm import Mapped, mapped_column

from app.api.v1.db import Base
# app/models/categorie_schema.py (Pydantic)
from pydantic import BaseModel, ConfigDict


class Categorie(Base):
  __tablename__ = "categorie"

  id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  nom: Mapped[str]
  supprimer: Mapped[int] = mapped_column(default=0)


class CategorieBaseSchema(BaseModel):
  nom: str

class CategorieCreateSchema(CategorieBaseSchema):
  pass

class CategorieSchema(CategorieBaseSchema):
  id: int
  supprimer: int = 0

  model_config = ConfigDict(from_attributes=True)  # Pydantic v2
