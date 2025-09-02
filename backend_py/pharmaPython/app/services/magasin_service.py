# services/magasin_service.py
from __future__ import annotations
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from fastapi import HTTPException

from app.models.magasin import Magasin
from app.repositories.magasin_repository import MagasinRepository


def _page_tuple(page: int, size: int) -> Tuple[int, int]:
  return (max(0, int(page)), max(1, int(size)))


class MagasinService:
  def __init__(self, db: Session):
    self.db = db
    self.magasin_repo = MagasinRepository(db)

  # createMagasin
  def create_magasin(self, magasin: Magasin) -> Magasin:
    print("magasin")
    print(magasin)
    mag = Magasin()
    mag.nom = magasin.nom
    mag.code = magasin.code
    self.db.add(mag)
    self.db.commit()
    self.db.refresh(mag)
    return mag

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
  )  -> Dict[str, Any]:
    page, size = _page_tuple(page, size)
    rows, total = self.magasin_repo.find_all_pageable(
      page=page,
      size=size)
    content = rows
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
    }

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
