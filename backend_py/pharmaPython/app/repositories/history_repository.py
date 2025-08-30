# repositories/history_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.history import History  # adapte

class HistoryRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[History]:
    return self.db.query(History).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[History], int]:
    q = self.db.query(History)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[History]:
    return self.db.query(History).get(id_)

  def save(self, entity: History) -> History:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: History) -> None:
    self.db.delete(entity); self.db.commit()
