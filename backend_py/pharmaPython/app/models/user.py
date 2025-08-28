from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class User(Base):
  __tablename__ = "user"

  id = Column(Integer, primary_key=True, autoincrement=True)
  nom = Column(String(32))
  prenom = Column(String(32))
  email = Column(String(64))
  password = Column(String)
  username = Column(String)
  fonction = Column(String(64))
  role = Column(String(64))
  telephone = Column(String(32))
  reduction = Column(Integer)
  reduction_max = Column(Integer)
  supprimer = Column(Integer, default=0)

# -------- Pydantic V2 --------
class UserSchema(BaseModel):
  id: int
  nom: str
  prenom: str
  email: str
  password: str
  username: str
  fonction: str
  role: str
  telephone: int
  reduction: int
  reduction_max: int
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}


# Schéma d'ENTRÉE (pour les bodies POST/PUT)
class UserIn(BaseModel):
  nom: str
  prenom: str
  email: str
  password: str
  username: str
  fonction: str
  role: str
  telephone: int
  reduction: int
  reduction_max: int
