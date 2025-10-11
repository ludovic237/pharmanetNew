# models/facture_electronique.py
from sqlalchemy import Column, Integer, BigInteger, String, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

from app.core.db import Base

class FactureElectronique(Base):
  __tablename__ = "facture_electronique"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True)
  facturation_id = Column(Integer, ForeignKey("facturation.id"), nullable=True)
  numero_telephone = Column(String(15), nullable=True)
  montant = Column(Integer, nullable=True)
  supprimer = Column(Integer, nullable=True, server_default="0", default=0)

  facturation = relationship("Facturation")

  # def __repr__(self) -> str:
  #   return (
  #     f"<FactureElectronique(id={self.id}, facturation_id={self.facturation_id}, "
  #     f"numero_telephone={self.numero_telephone!r}, montant={self.montant}, supprimer={self.supprimer})>"
  #   )
