# repositories/facture_espece_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.facture_espece import FactureEspece  # adapte

class FactureEspeceRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_facturation_id(self, facturation_id: int) -> Optional[FactureEspece]:
    return (
      self.db.query(FactureEspece)
      .filter(FactureEspece.facturation_id == facturation_id)
      .first()
    )

  def exists_by_facturation_id(self, facturation_id: int) -> bool:
    return (
      self.db.query(FactureEspece.id)
      .filter(FactureEspece.facturation_id == facturation_id)
      .first()
      is not None
    )

  # helpers
  def save(self, entity: FactureEspece) -> FactureEspece:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[FactureEspece]:
    return self.db.query(FactureEspece).get(id_)
  def delete(self, entity: FactureEspece) -> None:
    self.db.delete(entity); self.db.commit()
