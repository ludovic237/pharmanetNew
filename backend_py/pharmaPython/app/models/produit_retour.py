from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class ProduitRetour(Base):
  __tablename__ = "produit_retour"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  retour_produit_id = Column(Integer, ForeignKey("retour_produit.id"))
  concerner_id = Column(Integer, ForeignKey("concerner.id"))
  quantite = Column(Integer)
  supprimer = Column(Integer, default=0)

  retour_produit = relationship("RetourProduit")
  concerner = relationship("Concerner")
