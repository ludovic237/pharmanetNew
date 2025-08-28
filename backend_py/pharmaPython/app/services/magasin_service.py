# services/magasin_service.py
from __future__ import annotations
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from fastapi import HTTPException

from app.models.magasin import Magasin


class MagasinService:
  def __init__(self, db: Session):
    self.db = db

  # createMagasin
  def create_magasin(self, magasin: Magasin) -> Magasin:
    self.db.add(magasin)
    self.db.commit()
    self.db.refresh(magasin)
    return magasin

  # getAllMagasins
  def get_all_magasins(self) -> List[Magasin]:
    return self.db.query(Magasin).filter(
      (Magasin.supprimer == 0) | (Magasin.supprimer.is_(None))
    ).all()

  # getAllMagasinsPage(Pageable)
  # -> on renvoie (items, total) pour que le contrôleur construise {content, totalElements, ...}
  def get_all_magasins_page(
    self,
    page: int,
    size: int,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[Magasin], int]:
    q = self.db.query(Magasin).filter(
      (Magasin.supprimer == 0) | (Magasin.supprimer.is_(None))
    )

    total = q.count()

    order_col = getattr(Magasin, sort_by, Magasin.id)
    q = q.order_by(desc(order_col) if direction.upper() == "DESC" else asc(order_col))

    items = q.offset(page * size).limit(size).all()
    return items, total

  # updateMagasin(id, updatedMagasin)
  def update_magasin(self, id_: int, updated: Magasin) -> Magasin:
    existing: Optional[Magasin] = self.db.query(Magasin).filter(Magasin.id == id_).first()
    if not existing:
      raise HTTPException(status_code=404, detail="Magasin not found")

    # Kotlin ne met à jour que 'nom' (adresse commentée)
    if hasattr(updated, "nom"):
      existing.nom = updated.nom
    # si tu veux gérer d’autres champs, ajoute-les ici

    self.db.commit()
    self.db.refresh(existing)
    return existing

  # deleteMagasin(id) → suppression logique (supprimer = 1)
  def delete_magasin(self, id_: int) -> None:
    existing: Optional[Magasin] = self.db.query(Magasin).filter(Magasin.id == id_).first()
    if not existing:
      raise HTTPException(status_code=404, detail="Magasin not found")

    existing.supprimer = 1
    self.db.commit()
