# repositories/gerer_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.gerer import Gerer  # adapte

class GererRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Gerer]:
    return self.db.query(Gerer).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Gerer], int]:
    q = self.db.query(Gerer)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Gerer]:
    return self.db.query(Gerer).get(id_)

  def save(self, entity: Gerer) -> Gerer:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Gerer) -> None:
    self.db.delete(entity); self.db.commit()
