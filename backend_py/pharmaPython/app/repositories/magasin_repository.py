# repositories/magasin_repository.py
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.magasin import Magasin

class MagasinRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Magasin]:
    return self.db.query(Magasin).all()

  def find_all_pageable(self, page: int, size: int, search: str) -> Tuple[List[Magasin], int]:
    q = self.db.query(Magasin)
    if search != "null":
      q = q.filter(func.lower(Magasin.nom).like(f"%{search.lower()}%"))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Magasin]:
    return self.db.query(Magasin).get(id_)

  def save(self, entity: Magasin) -> Magasin:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Magasin) -> None:
    self.db.delete(entity); self.db.commit()
