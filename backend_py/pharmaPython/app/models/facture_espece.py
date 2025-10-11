from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.core.db import Base

class FactureEspece(Base):
  __tablename__ = "facture_espece"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  facturation_id = Column(Integer, ForeignKey("facturation.id"), nullable=True)
  montant = Column(Integer)
  supprimer = Column(Integer, default=0)

  facturation = relationship("Facturation")
