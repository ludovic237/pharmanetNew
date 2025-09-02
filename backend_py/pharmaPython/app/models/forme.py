from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base

class Forme(Base):
  __tablename__ = "forme"
  __table_args__ = {"extend_existing": True}

  id : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
  code : Mapped[str]
  nom : Mapped[str]
  supprimer : Mapped[int] = mapped_column(default=0)

class FormeBaseSchema(BaseModel):
  # code : str
  nom : str

class FormCreateSchema(FormeBaseSchema):
  pass


class FormeSchema(FormeBaseSchema):
  id : int
  supprimer : int = 0

  model_config = ConfigDict(from_attributes=True)  # Pydantic v2


class FormeIn(BaseModel):
  code : str
  nom : str
  supprimer : int = 0
