from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base


class ProduitCmd(Base):
  __tablename__ = "produit_cmd"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)

  prix_public = Column(Float, default=0.0)

  # >>> AJOUTE les ForeignKey explicites <<<
  produit_id = Column(Integer, ForeignKey("produit.id"), nullable=False)
  commande_id = Column(Integer, ForeignKey("commande.id"), nullable=False)

  pu_cmd = Column(Float, default=0.0)
  pt_cmd = Column(Float, default=0.0)
  qtite_cmd = Column(Integer)

  pu_recept = Column(Float, default=0.0)
  pt_recept = Column(Float, default=0.0)
  qtite_recu = Column(Integer)
  unite_gratuite = Column(Integer)

  etat = Column(String)
  supprimer = Column(Integer, default=0)

  # >>> ALIGNE les relations avec les autres modèles <<<
  # Si Commande définit: produits_cmd = relationship("ProduitCmd", back_populates="commande")
  commande = relationship("Commande", back_populates="produits_cmd")

  produit = relationship("Produit")
  # Si Produit définit: produits_cmd = relationship("ProduitCmd", back_populates="produit")
  # produit = relationship("Produit", back_populates="produits_cmd")

  # produit = relationship("Produit", foreign_keys=[produit_id])
  # produit = relationship("Produit", foreign_keys=[produit_id])
  # commande = relationship("Commande", foreign_keys=[commande_id])
  # commande = relationship("Commande", foreign_keys=[commande_id])
  #
  # produit = relationship("Produit", back_populates="produits_cmd")
