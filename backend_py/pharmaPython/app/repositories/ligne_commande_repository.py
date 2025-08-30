# repositories/ligne_commande_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.ligne_commande import LigneCommande

class LigneCommandeRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> List[LigneCommande]:
    return self.db.query(LigneCommande).all()

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[LigneCommande], int]:
    q = self.db.query(LigneCommande)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[LigneCommande]:
    return self.db.query(LigneCommande).get(id_)

  def save(self, entity: LigneCommande) -> LigneCommande:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: LigneCommande) -> None:
    self.db.delete(entity); self.db.commit()
