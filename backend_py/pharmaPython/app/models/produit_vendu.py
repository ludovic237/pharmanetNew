from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class ProduitVendu(Base):
  __tablename__ = "produit_vendu"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  qtite_vendu = Column(Integer, nullable=True)
  tva = Column(Float, default=0.0)
  prix_unit = Column(Float, default=0.0)
  montant_ttc = Column(Float, default=0.0)

  produit_id = Column(Integer, ForeignKey("produit.id"))
  produit = relationship("Produit", back_populates="produits_vendus")

  vente_id = Column(Integer, ForeignKey("vente.id"))
  vente = relationship("Vente", back_populates="produits_vendus")
