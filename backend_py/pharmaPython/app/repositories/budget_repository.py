# repositories/budget_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.budget import Budget  # adapte

class BudgetRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Budget]:
    return self.db.query(Budget).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Budget], int]:
    q = self.db.query(Budget)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Budget]:
    return self.db.query(Budget).get(id_)
  def save(self, entity: Budget) -> Budget:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: Budget) -> None:
    self.db.delete(entity); self.db.commit()
