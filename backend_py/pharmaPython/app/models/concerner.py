from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base


class Concerner(Base):
  __tablename__ = "concerner"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  vente_id = Column(Integer, ForeignKey("vente.id"))
  # vente_id = Column(Integer)
  produit_id = Column(Integer)
  en_rayon_id = Column(String)
  prix_unit = Column(Integer, default=0)
  quantite = Column(Integer, default=0)
  reduction = Column(Integer, default=0)
  supprimer = Column(Integer, default=0)
  type = Column(String, default="en rayon")

  vente = relationship("Vente")
