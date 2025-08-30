# repositories/produit_inventaire_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.produit_inventaire import ProduitInventaire
from app.models.inventaire import Inventaire
from app.models.en_rayon import EnRayon

class ProduitInventaireRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_inventaire(self, inventaire: Inventaire) -> List[ProduitInventaire]:
    return self.db.query(ProduitInventaire).filter(
      ProduitInventaire.inventaire_id == inventaire.id
    ).all()

  def find_by_inventaire_pageable(
    self, inventaire: Inventaire, page: int, size: int
  ) -> Tuple[List[ProduitInventaire], int]:
    q = self.db.query(ProduitInventaire).filter(
      ProduitInventaire.inventaire_id == inventaire.id
    )
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_inventaire_and_en_rayon(
    self, inventaire: Inventaire, en_rayon: EnRayon
  ) -> Optional[ProduitInventaire]:
    return self.db.query(ProduitInventaire).filter(
      ProduitInventaire.inventaire_id == inventaire.id,
      ProduitInventaire.en_rayon_id == en_rayon.id,
      ).first()

  def find_by_inventaire_and_en_rayon_in_pageable(
    self, inventaire: Inventaire, en_rayon_list: list[EnRayon], page: int, size: int
  ) -> Tuple[List[ProduitInventaire], int]:
    ids = [e.id for e in en_rayon_list]
    q = self.db.query(ProduitInventaire).filter(
      ProduitInventaire.inventaire_id == inventaire.id,
      ProduitInventaire.en_rayon_id.in_(ids) if ids else False,
      )
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  # helpers
  def save(self, entity: ProduitInventaire) -> ProduitInventaire:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[ProduitInventaire]:
    return self.db.query(ProduitInventaire).get(id_)
  def delete(self, entity: ProduitInventaire) -> None:
    self.db.delete(entity); self.db.commit()
