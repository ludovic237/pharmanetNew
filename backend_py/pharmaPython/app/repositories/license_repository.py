# repositories/license_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.license import License  # adapte

class LicenseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[License]:
    return self.db.query(License).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[License], int]:
    q = self.db.query(License)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[License]:
    return self.db.query(License).get(id_)

  def save(self, entity: License) -> License:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: License) -> None:
    self.db.delete(entity); self.db.commit()
