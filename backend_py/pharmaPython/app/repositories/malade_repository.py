# repositories/malade_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.malade import Malade

class MaladeRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Malade]:
    return self.db.query(Malade).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Malade], int]:
    q = self.db.query(Malade)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Malade]:
    return self.db.query(Malade).get(id_)

  def save(self, entity: Malade) -> Malade:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Malade) -> None:
    self.db.delete(entity); self.db.commit()
