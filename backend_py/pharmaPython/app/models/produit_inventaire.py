from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class ProduitInventaire(Base):
  __tablename__ = "produit_inventaire"

  id = Column(Integer, primary_key=True, autoincrement=True)
  inventaire_id = Column(Integer, ForeignKey("inventaire.id"))
  employe_id = Column(Integer, ForeignKey("employe.id"))
  en_rayon_id = Column(Integer, ForeignKey("en_rayon.id"))
  stock_avant = Column(Integer)
  stock_valide = Column(Integer)
  date_debut = Column(DateTime)
  date_fin = Column(DateTime)
  type = Column(String(100))
  statut = Column(String(100))
  supprimer = Column(Integer, default=0, nullable=False)

  inventaire = relationship("Inventaire")
  employe = relationship("Employe")
  en_rayon = relationship("EnRayon")
