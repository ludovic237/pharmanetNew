from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Produit1(Base):
  __tablename__ = "produit1"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  ean13 = Column(String(16), nullable=False)
  reference = Column(String(32), nullable=False)
  nom = Column(String(32))
  contenance = Column(String, nullable=False)
  stock = Column(Integer)
  stock_max = Column(Integer)
  stock_min = Column(Integer)
  date_peremption = Column(DateTime)
  date_cmd = Column(DateTime)
  stock_mag = Column(Integer)
  prix_public = Column(Float, default=0.0)
  prix_achat = Column(Float, default=0.0)
  categorie_id = Column(Integer, ForeignKey("categorie.id"))
  forme_id = Column(Integer, ForeignKey("forme.id"))
  fabriquant_id = Column(Integer, ForeignKey("fabriquant.id"))
  fournisseur_id = Column(Integer, ForeignKey("fournisseur.id"))
  rayon_id = Column(Integer, ForeignKey("rayon.id"))
  magasin_id = Column(Integer, ForeignKey("magasin.id"))
  unite_id = Column(Integer, ForeignKey("unite.id"))

  categorie = relationship("Categorie")
  forme = relationship("Forme")
  fabriquant = relationship("Fabriquant")
  fournisseur = relationship("Fournisseur")
  rayon = relationship("Rayon")
  magasin = relationship("Magasin")
  unite = relationship("Unite")
