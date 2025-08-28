from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class ProduitCmd(Base):
  __tablename__ = "produit_cmd"

  id = Column(Integer, primary_key=True, autoincrement=True)
  prix_public = Column(Float, default=0.0)
  produit_id = Column(Integer)
  commande_id = Column(Integer)
  pu_cmd = Column(Float, default=0.0)
  pt_cmd = Column(Float, default=0.0)
  qtite_cmd = Column(Integer)
  pu_recept = Column(Float, default=0.0)
  pt_recept = Column(Float, default=0.0)
  qtite_recu = Column(Integer)
  unite_gratuite = Column(Integer)
  etat = Column(String)
  supprimer = Column(Integer, default=0)

  produit = relationship("Produit", foreign_keys=[produit_id])
  commande = relationship("Commande", foreign_keys=[commande_id])
