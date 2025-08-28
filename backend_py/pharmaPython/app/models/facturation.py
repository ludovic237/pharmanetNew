from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.db import Base

class Facturation(Base):
  __tablename__ = "facturation"

  id = Column(Integer, primary_key=True)
  vente_id = Column(Integer, ForeignKey("vente.id"))
  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  vente = relationship("Vente", lazy="select")
  caisse = relationship("Caisse", lazy="select")
  type_paiement = Column(String(100))
  montant_percu = Column(Integer)
  reste = Column(Integer)
  montant_ttc = Column(Integer)
  date_facture = Column(DateTime)
  supprimer = Column(Integer, default=0)
