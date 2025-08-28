from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Commande(Base):
  __tablename__ = "commande"

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

  produits = relationship("ProduitCmd", back_populates="commande", lazy="joined", cascade="all, delete-orphan")

  # Constantes d’état (à importer ailleurs si nécessaire)
  COMMANDE_ANNULER = "ANNULER"
  COMMANDE_LIVREE = "LIVREE"
  COMMANDE_EN_COURS = "EN_COURS"
  COMMANDE_EN_ATTENTE = "EN_ATTENTE"
  COMMANDE_CLOTUREE = "CLOTUREE"
  RECEPTION_COMPLETE = "COMPLETE"
  RECEPTION_PARTIEL = "PARTIEL"
  RECEPTION_ANNULER = "ANNULER"
