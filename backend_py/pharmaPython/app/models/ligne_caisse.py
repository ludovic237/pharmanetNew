from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class LigneCaisse(Base):
  __tablename__ = "ligne_caisse"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  produit_id = Column(Integer, ForeignKey("produit.id"))
  libelle = Column(String, nullable=False)
  date_ligne = Column(DateTime, nullable=False)
  debit = Column(Float, default=0.0)
  credit = Column(Float, default=0.0)
  type = Column(String(32), nullable=False)
  ref_produit = Column(Integer, nullable=False)
  motif = Column(String(128), nullable=False)

  caisse = relationship("Caisse", lazy="select")
  produit = relationship("Produit", lazy="select")
