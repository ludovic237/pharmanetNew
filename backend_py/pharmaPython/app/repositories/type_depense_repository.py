# repositories/type_depense_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.type_depense import TypeDepense  # adapte

class TypeDepenseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[TypeDepense]:
    return self.db.query(TypeDepense).all()

  def find_all_pageable(self, page: int, size: int, sort_by: str = "id", direction: str = "DESC") -> Tuple[List[TypeDepense], int]:
    q = self.db.query(TypeDepense)
    total = q.count()
    col = getattr(TypeDepense, sort_by, TypeDepense.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[TypeDepense]:
    return self.db.query(TypeDepense).get(id_)

  def save(self, entity: TypeDepense) -> TypeDepense:
    self.db.add(entity)
    self.db.commit()
    self.db.refresh(entity)
    return entity

  def delete(self, entity: TypeDepense) -> None:
    self.db.delete(entity)
    self.db.commit()
