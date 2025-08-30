# repositories/fabriquant_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.fabriquant import Fabriquant

class FabriquantRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Fabriquant]:
    return self.db.query(Fabriquant).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Fabriquant], int]:
    q = self.db.query(Fabriquant)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Fabriquant]:
    return self.db.query(Fabriquant).get(id_)

  def save(self, entity: Fabriquant) -> Fabriquant:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Fabriquant) -> None:
    self.db.delete(entity); self.db.commit()
