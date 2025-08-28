from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class EnRayon(Base):
  __tablename__ = "en_rayon"
  __table_args__ = {"extend_existing": True}

  id = Column(String, primary_key=True)
  produit_id = Column(Integer)
  # produit = relationship("Produit", lazy="select", primaryjoin="EnRayon.produit_id==Produit.id", viewonly=True)
  # produit = relationship("Produit", back_populates="en_rayon")
  fournisseur_id = Column(Integer, ForeignKey("fournisseur.id"))
  # fournisseur = relationship("Fournisseur", lazy="joined")
  commande_id = Column(Integer, ForeignKey("commande.id"))
  # commande = relationship("Commande", lazy="select")
  date_livraison = Column(DateTime)
  date_peremption = Column(DateTime)
  prix_achat = Column(Integer, default=0)
  prix_vente = Column(Integer, default=0)
  reduction = Column(Integer, default=0)
  quantite = Column(Integer, default=0)
  quantite_restante = Column(Integer, default=0)
  supprimer = Column(Integer, default=0)

class EnRayonIn(BaseModel):

  id : Optional[str]
  produit_id : Optional[int]
  fournisseur_id : Optional[int]
  commande_id : Optional[int]
  date_livraison : Optional[datetime]
  date_peremption : Optional[datetime]
  prix_achat : Optional[int]
  prix_vente : Optional[int]
  reduction : Optional[int]
  quantite : Optional[int]
  quantite_restante : Optional[int]
  supprimer : Optional[int]

  # Pydantic v2
  model_config = {"from_attributes": True}
  # (en v1: class Config: orm_mode = True)
