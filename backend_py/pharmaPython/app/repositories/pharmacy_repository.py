# repositories/pharmacy_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.pharmacy import Pharmacy

class PharmacyRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Pharmacy]:
    return self.db.query(Pharmacy).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[Pharmacy], int]:
    q = self.db.query(Pharmacy)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Pharmacy]:
    return self.db.query(Pharmacy).get(id_)

  def save(self, entity: Pharmacy) -> Pharmacy:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Pharmacy) -> None:
    self.db.delete(entity); self.db.commit()
