from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.api.v1.db import Base

class Facturation(Base):
  __tablename__ = "facturation"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  vente_id = Column(Integer, ForeignKey("vente.id"), nullable=False)
  caisse_id = Column(Integer, ForeignKey("caisse.id"), nullable=False)
  vente = relationship("Vente", lazy="joined")
  caisse = relationship("Caisse", lazy="joined")
  type_paiement = Column(String(100))
  montant_percu = Column(Integer)
  reste = Column(Integer)
  montant_ttc = Column(Integer)
  date_facture = Column(DateTime)
  supprimer = Column(Integer, default=0)
