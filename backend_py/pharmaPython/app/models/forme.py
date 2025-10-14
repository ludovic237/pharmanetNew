from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base

class Forme(Base):
  __tablename__ = "forme"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  supprimer = Column(Integer, default=0)

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
