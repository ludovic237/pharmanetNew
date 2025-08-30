# repositories/transaction_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.transaction import Transaction  # adapte le chemin

class TransactionRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Transaction]:
    return self.db.query(Transaction).all()

  def find_all_pageable(self, page: int, size: int, sort_by: str = "id", direction: str = "DESC") -> Tuple[List[Transaction], int]:
    q = self.db.query(Transaction)
    total = q.count()
    col = getattr(Transaction, sort_by, Transaction.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Transaction]:
    return self.db.query(Transaction).get(id_)

  def save(self, entity: Transaction) -> Transaction:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Transaction) -> None:
    self.db.delete(entity); self.db.commit()
