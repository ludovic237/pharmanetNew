# repositories/bon_caisse_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.bon_caisse import BonCaisse  # adapte

class BonCaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_codebarre_id(self, codebarre_id: str) -> Optional[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.codebarre_id == codebarre_id)
      .first()
    )

  def find_generated_by_caisse_id(self, caisse_id: str) -> List[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.caisse_id == caisse_id, BonCaisse.type == "Générer")
      .all()
    )

  def find_encaisse_by_caisse_id(self, caisse_id: str) -> List[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.caisse_id == caisse_id, BonCaisse.type == "Encaisser")
      .all()
    )

  # helpers
  def save(self, entity: BonCaisse) -> BonCaisse:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[BonCaisse]:
    return self.db.query(BonCaisse).get(id_)
  def delete(self, entity: BonCaisse) -> None:
    self.db.delete(entity); self.db.commit()
