from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Forme(Base):
  __tablename__ = "forme"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  supprimer = Column(Integer, default=0)


class FormeSchema(BaseModel):
  id : int
  code : str
  nom : str
  supprimer : int = 0
  model_config = {"from_attributes": True}


class FormeIn(BaseModel):
  code : str
  nom : str
  supprimer : int = 0
