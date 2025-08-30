# repositories/prescripteur_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.prescripteur import Prescripteur

class PrescripteurRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Prescripteur]:
    return self.db.query(Prescripteur).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Prescripteur], int]:
    q = self.db.query(Prescripteur)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Prescripteur]:
    return self.db.query(Prescripteur).get(id_)

  def save(self, entity: Prescripteur) -> Prescripteur:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Prescripteur) -> None:
    self.db.delete(entity); self.db.commit()
