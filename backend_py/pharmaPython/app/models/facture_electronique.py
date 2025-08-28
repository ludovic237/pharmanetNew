# models/facture_electronique.py
from sqlalchemy import Column, Integer, BigInteger, String, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class FactureElectronique(Base):
  __tablename__ = "facture_electronique"

  id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
  # En Kotlin: Long? ; on peut mapper en BigInteger (ou Integer si votre DB l'utilise)
  facturation_id = Column(BigInteger, ForeignKey("facturation.id"), nullable=True)

  # length = 15 en Kotlin
  numero_telephone = Column(String(15), nullable=True)

  montant = Column(Integer, nullable=True)

  # @ColumnDefault("0") en Kotlin → server_default côté SQL + default Python
  supprimer = Column(Integer, nullable=True, server_default="0", default=0)

  def __repr__(self) -> str:
    return (
      f"<FactureElectronique(id={self.id}, facturation_id={self.facturation_id}, "
      f"numero_telephone={self.numero_telephone!r}, montant={self.montant}, supprimer={self.supprimer})>"
    )
