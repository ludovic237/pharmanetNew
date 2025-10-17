# repositories/forme_repository.py
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.forme import Forme  # adapte


class FormeRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[Forme]:
    return self.db.query(Forme).all()

  def find_all_pageable(self, page: int, size: int, search: str) -> Tuple[List[Forme], int]:
    q = self.db.query(Forme)
    if search != "null":
      q = q.filter(func.lower(Forme.nom).like(f"%{search.lower()}%"))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Forme]:
    return self.db.query(Forme).get(id_)

  def save(self, entity: Forme) -> Forme:
    self.db.add(entity);
    self.db.commit();
    self.db.refresh(entity);
    return entity

  def delete(self, entity: Forme) -> None:
    self.db.delete(entity);
    self.db.commit()
