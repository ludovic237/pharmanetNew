# repositories/en_rayon_inventaire_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.en_rayon_inventaire import EnRayonInventaire

class EnRayonInventaireRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_id(self, id_: int) -> Optional[EnRayonInventaire]:
    return self.db.query(EnRayonInventaire).get(id_)

  def save(self, entity: EnRayonInventaire) -> EnRayonInventaire:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: EnRayonInventaire) -> None:
    self.db.delete(entity); self.db.commit()
