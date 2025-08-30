# repositories/inventaire_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.inventaire import Inventaire  # adapte

class InventaireRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Inventaire]:
    return self.db.query(Inventaire).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Inventaire], int]:
    q = self.db.query(Inventaire)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Inventaire]:
    return self.db.query(Inventaire).get(id_)

  def save(self, entity: Inventaire) -> Inventaire:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Inventaire) -> None:
    self.db.delete(entity); self.db.commit()
