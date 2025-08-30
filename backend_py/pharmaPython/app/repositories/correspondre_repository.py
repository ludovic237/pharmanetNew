# repositories/correspondre_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.correspondre import Correspondre

class CorrespondreRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Correspondre]:
    return self.db.query(Correspondre).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Correspondre], int]:
    q = self.db.query(Correspondre)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Correspondre]:
    return self.db.query(Correspondre).get(id_)

  def save(self, entity: Correspondre) -> Correspondre:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Correspondre) -> None:
    self.db.delete(entity); self.db.commit()
