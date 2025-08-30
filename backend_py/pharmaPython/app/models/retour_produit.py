from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base

class RetourProduit(Base):
  __tablename__ = "retour_produit"

  id = Column(Integer, primary_key=True, index=True)

  vente_id = Column(Integer, ForeignKey("vente.id"))
  vente = relationship("Vente")
  # vente = relationship("Vente", back_populates="retours_produit")

  employe_id = Column(Integer, ForeignKey("employe.id"))
  employe = relationship("Employe")
  # employe = relationship("Employe", back_populates="retours_produit")

  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  caisse = relationship("Caisse")

  date_retour = Column(DateTime, nullable=True)
  supprimer = Column(Integer, default=0)
