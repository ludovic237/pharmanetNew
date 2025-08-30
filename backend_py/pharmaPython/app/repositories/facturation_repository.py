# repositories/facturation_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.facturation import Facturation

class FacturationRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_vente(self, vente_id: int) -> Optional[Facturation]:
    return self.db.query(Facturation).filter(Facturation.vente_id == vente_id).first()

  def find_by_caisse(self, caisse_id: int) -> List[Facturation]:
    return self.db.query(Facturation).filter(Facturation.caisse_id == caisse_id).all()

  # helpers
  def find_by_id(self, id_: int) -> Optional[Facturation]:
    return self.db.query(Facturation).get(id_)
  def save(self, entity: Facturation) -> Facturation:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: Facturation) -> None:
    self.db.delete(entity); self.db.commit()
