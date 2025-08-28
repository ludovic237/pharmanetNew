from pydantic import BaseModel
from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Fournisseur(Base):
  __tablename__ = "fournisseur"

  id = Column(Integer, primary_key=True)
  code = Column(String(16))
  nom = Column(String(32))
  statut = Column(String(32))
  codepostal = Column(String(20))
  adresse = Column(String(32))
  telephone = Column(String(32))
  email = Column(String(32))
  supprimer = Column(Integer, default=0)


class FournisseurSchema(BaseModel):

  id : int
  code : str
  nom : str
  statut : str
  codepostal : str
  adresse : str
  telephone : str
  email : str
  supprimer : int=0


class FournisseurIn(BaseModel):

  code : str
  nom : str
  statut : str
  codepostal : str
  adresse : str
  telephone : str
  email : str
