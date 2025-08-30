# repositories/produit_detail_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.produit_detail import ProduitDetail  # adapte le chemin

class ProduitDetailRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_nom_containing_ignore_case_and_supprimer_is(
    self, nom: str, supprimer: int
  ) -> List[ProduitDetail]:
    return (
      self.db.query(ProduitDetail)
      .filter(
        func.lower(ProduitDetail.nom).like(f"%{nom.lower()}%"),
        ProduitDetail.supprimer == supprimer,
        )
      .all()
    )

  # pageable
  def find_by_nom_containing_ignore_case_and_supprimer_is_pageable(
    self, nom: str, supprimer: int, page: int, size: int
  ) -> Tuple[List[ProduitDetail], int]:
    q = (
      self.db.query(ProduitDetail)
      .filter(
        func.lower(ProduitDetail.nom).like(f"%{nom.lower()}%"),
        ProduitDetail.supprimer == supprimer,
        )
    )
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  # doublon “Contains/Containing” dans le Kotlin → on fournit une seule variante
  def find_by_nom_containing_ignore_case_and_supprimer_pageable(
    self, nom: str, supprimer: int, page: int, size: int
  ) -> Tuple[List[ProduitDetail], int]:
    return self.find_by_nom_containing_ignore_case_and_supprimer_is_pageable(
      nom, supprimer, page, size
    )

  def find_by_id_and_stock_greater_than_and_supprimer(
    self, produit_id: int, quantite: int = 0, supprimer: int = 0
  ) -> Optional[ProduitDetail]:
    return (
      self.db.query(ProduitDetail)
      .filter(
        ProduitDetail.id == produit_id,
        ProduitDetail.stock > quantite,
        ProduitDetail.supprimer == supprimer,
        )
      .first()
    )

  # “Specification” Kotlin filterProduitDetail(supprimer) → simple filtre Python
  def find_all_filtered_supprimer_pageable(
    self, supprimer: Optional[int], page: int, size: int
  ) -> Tuple[List[ProduitDetail], int]:
    q = self.db.query(ProduitDetail)
    if supprimer is not None:
      q = q.filter(ProduitDetail.supprimer == supprimer)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  # helpers
  def find_by_id(self, id_: int) -> Optional[ProduitDetail]:
    return self.db.query(ProduitDetail).get(id_)

  def model(self) -> ProduitDetail:
    return ProduitDetail()

  def save(self, entity: ProduitDetail) -> ProduitDetail:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
