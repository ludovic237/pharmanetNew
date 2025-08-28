from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Produit(Base):
  __tablename__ = "produit"

  id = Column(Integer, primary_key=True)
  ean13 = Column(String(16))
  code_laborex = Column(String(32))
  code_ubipharm = Column(String(32))
  reference = Column(String(32))
  nom = Column(String(50))
  stock = Column(Integer)
  stock_max = Column(Integer)
  stock_min = Column(Integer)
  contenu_detail = Column(String(10))
  prix_detail = Column(String(10))
  etat = Column(String(10), default='Utile')
  reduction_max = Column(Integer, default=0)
  grossiste_id = Column(String(100))
  detail_id = Column(Integer)
  categorie_id = Column(Integer, ForeignKey("categorie.id"))
  forme_id = Column(Integer, ForeignKey("forme.id"))
  fabriquant_id = Column(Integer, ForeignKey("fabriquant.id"))
  rayon_id = Column(Integer, ForeignKey("rayon.id"))
  etagere = Column(String(15))
  magasin_id = Column(Integer, ForeignKey("magasin.id"))
  supprimer = Column(Integer, default=0)

  categorie = relationship("Categorie")
  forme = relationship("Forme")
  fabriquant = relationship("Fabriquant")
  rayon = relationship("Rayon")
  magasin = relationship("Magasin")
