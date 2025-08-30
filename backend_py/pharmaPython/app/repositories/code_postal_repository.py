# repositories/code_postal_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.code_postal import CodePostal  # adapte

class CodePostalRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[CodePostal]:
    return self.db.query(CodePostal).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[CodePostal], int]:
    q = self.db.query(CodePostal)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[CodePostal]:
    return self.db.query(CodePostal).get(id_)
  def save(self, entity: CodePostal) -> CodePostal:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: CodePostal) -> None:
    self.db.delete(entity); self.db.commit()
