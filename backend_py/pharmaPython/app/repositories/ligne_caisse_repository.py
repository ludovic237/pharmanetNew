# repositories/ligne_caisse_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.ligne_caisse import LigneCaisse

class LigneCaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[LigneCaisse]:
    return self.db.query(LigneCaisse).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[LigneCaisse], int]:
    q = self.db.query(LigneCaisse)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[LigneCaisse]:
    return self.db.query(LigneCaisse).get(id_)

  def save(self, entity: LigneCaisse) -> LigneCaisse:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: LigneCaisse) -> None:
    self.db.delete(entity); self.db.commit()
