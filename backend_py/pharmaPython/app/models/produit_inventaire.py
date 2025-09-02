from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base


class ProduitInventaire(Base):
  __tablename__ = "produit_inventaire"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  inventaire_id = Column(Integer, ForeignKey("inventaire.id"))
  employe_id = Column(Integer, ForeignKey("employe.id"))
  en_rayon_id = Column(Integer, ForeignKey("en_rayon.id"))
  stock_avant = Column(Integer)
  stock_valide = Column(Integer)
  supprimer = Column(Integer, default=0, nullable=False)

  inventaire = relationship("Inventaire")
  employe = relationship("Employe")
  en_rayon = relationship("EnRayon")


class ProduitInventaireSchema(BaseModel):
  id: int
  inventaire_id: int
  employe_id: int
  en_rayon_id: int
  stock_avant: int
  stock_valide: int
  supprimer: int = 0

  # Pydantic v2 (remplace orm_mode=True)
  model_config = {"from_attributes": True}


class ProduitInventaireIn(BaseModel):
  inventaire_id: int
  employe_id: int
  en_rayon_id: int
  stock_avant: int
  stock_valide: int
