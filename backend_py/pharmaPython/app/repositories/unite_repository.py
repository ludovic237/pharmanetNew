# repositories/unite_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.unite import Unite  # adapte le chemin

class UniteRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Unite]:
    return self.db.query(Unite).all()

  def find_all_pageable(self, page: int, size: int, sort_by: str = "id", direction: str = "DESC") -> Tuple[List[Unite], int]:
    q = self.db.query(Unite)
    total = q.count()
    col = getattr(Unite, sort_by, Unite.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Unite]:
    return self.db.query(Unite).get(id_)

  def save(self, entity: Unite) -> Unite:
    self.db.add(entity)
    self.db.commit()
    self.db.refresh(entity)
    return entity

  def delete(self, entity: Unite) -> None:
    self.db.delete(entity)
    self.db.commit()
