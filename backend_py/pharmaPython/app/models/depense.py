from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from app.core.db import Base


class Depense(Base):
  __tablename__ = "depense"

  id = Column(Integer, primary_key=True, index=True)
  caisse_id = Column(String(10))
  designation = Column(String)
  quantite = Column(Integer, default=0)
  prix_unitaire = Column(Integer, default=0)
  date_depense = Column(DateTime)
  beneficiaire = Column(String(100))
  numero_cni = Column(String(100))
  date_delivrance = Column(DateTime)
  lieu_delivrance = Column(String(100))
  societe = Column(String(100))
  type_depense = Column(Integer)
  supprimer = Column(Integer, default=0)


class DepenseIn(BaseModel):
  id: Optional[int]
  caisse_id: Optional[str]
  designation: Optional[str]
  quantite: Optional[int]
  prix_unitaire: Optional[int]
  date_depense: Optional[datetime]
  beneficiaire: Optional[str]
  numero_cni: Optional[str]
  date_delivrance: Optional[datetime]
  lieu_delivrance: Optional[str]
  societe: Optional[str]
  type_depense: Optional[int]
  supprimer: Optional[int]
