from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.api.v1.db import Base


class Commande(Base):
  __tablename__ = "commande"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  employe_id = Column(Integer)
  date_creation = Column(DateTime)
  date_livraison = Column(DateTime)
  note = Column(String)
  fournisseur_id = Column(Integer, ForeignKey("fournisseur.id"))
  fournisseur = relationship("Fournisseur", lazy="joined")
  qtite_cmd = Column(Integer)
  qtite_recu = Column(Integer)
  unite_gratuite = Column(Integer)
  montant_cmd = Column(Float, default=0.0)
  montant_recu = Column(Float, default=0.0)
  etat = Column(String(32))
  ref = Column(String(32))
  supprimer = Column(Integer, default=0)
  produits_cmd = relationship("ProduitCmd", back_populates="commande")
  # produits = relationship("ProduitCmd", back_populates="commande", lazy="joined", cascade="all, delete-orphan")


# produits_cmd = relationship("ProduitCmd", back_populates="commande", cascade="all, delete-orphan")

# Constantes d’état (à importer ailleurs si nécessaire)
COMMANDE_ANNULER = "ANNULER"
COMMANDE_LIVREE = "LIVREE"
COMMANDE_EN_COURS = "EN_COURS"
COMMANDE_EN_ATTENTE = "EN_ATTENTE"
COMMANDE_CLOTUREE = "CLOTUREE"
RECEPTION_COMPLETE = "COMPLETE"
RECEPTION_PARTIEL = "PARTIEL"
RECEPTION_ANNULER = "ANNULER"


class CommandeSchema(BaseModel):
  id: int
  employe_id: Optional[int] = None
  date_creation: Optional[int] = None
  date_livraison: Optional[int] = None
  note: Optional[int] = None
  fournisseur_id: Optional[int] = None
  qtite_cmd: Optional[int] = None
  qtite_recu: Optional[int] = None
  unite_gratuite: Optional[int] = None
  montant_cmd: Optional[int] = None
  montant_recu: Optional[int] = None
  etat: Optional[int] = None
  ref: Optional[int] = None
  supprimer: Optional[int] = None

  model_config = {"from_attributes": True}


class CommandeIn(BaseModel):
  employe_id: Optional[int] = None
  date_creation: Optional[int] = None
  date_livraison: Optional[int] = None
  note: Optional[int] = None
  fournisseur_id: Optional[int] = None
  qtite_cmd: Optional[int] = None
  qtite_recu: Optional[int] = None
  unite_gratuite: Optional[int] = None
  montant_cmd: Optional[int] = None
  montant_recu: Optional[int] = None
  etat: Optional[int] = None
  ref: Optional[int] = None
