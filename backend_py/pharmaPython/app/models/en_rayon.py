from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class EnRayon(Base):
  __tablename__ = "en_rayon"

  id = Column(String, primary_key=True)
  produit_id = Column(Integer)
  produit = relationship("Produit", lazy="select", primaryjoin="EnRayon.produit_id==Produit.id", viewonly=True)
  fournisseur_id = Column(Integer, ForeignKey("fournisseur.id"))
  fournisseur = relationship("Fournisseur", lazy="joined")
  commande_id = Column(Integer, ForeignKey("commande.id"))
  commande = relationship("Commande", lazy="select")
  date_livraison = Column(DateTime)
  date_peremption = Column(DateTime)
  prix_achat = Column(Integer, default=0)
  prix_vente = Column(Integer, default=0)
  reduction = Column(Integer, default=0)
  quantite = Column(Integer, default=0)
  quantite_restante = Column(Integer, default=0)
  supprimer = Column(Integer, default=0)
