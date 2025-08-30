# services/rayon_service.py
from __future__ import annotations
from typing import Dict, Any, Tuple, List
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.rayon_repository import RayonRepository


def _page_norm(page: int, size: int) -> Tuple[int, int]:
  return (max(0, int(page)), max(1, int(size)))

class RayonService:
  """
  Port Python de RayonService.kt.
  Les accès DB Spring Data sont remplacés par un repository/DAO SQLAlchemy injecté.
  """
  def __init__(self, db: Session):
    self.db = db
    self.rayon_repo = RayonRepository(db)

  # createRayon(rayon)
  def create_rayon(self, rayon) -> Any:
    return self.rayon_repo.save(rayon)

  # getAllRayons()
  def get_all_rayons(self) -> List[Any]:
    return self.rayon_repo.find_all()

  # getAllRayonsPage(pageable)
  def get_all_rayons_page(self, page: int, size: int, sort_by: str = "id") -> Dict[str, Any]:
    p, s = _page_norm(page, size)
    rows, total = self.rayon_repo.find_all_pageable(page=p, size=s, sort=sort_by, direction="DESC")
    return {
      "content": rows,
      "totalElements": total,
      "totalPages": (total + s - 1) // s if s else 1,
      "pageSize": s,
      "pageNumber": p,
      "sort": sort_by,
      "direction": "DESC",
    }

  # updateRayon(id, updatedRayon)
  def update_rayon(self, id_: int, updated_rayon) -> Any:
    rayon = self.rayon_repo.find_by_id(id_)
    if not rayon:
      raise HTTPException(status_code=404, detail="Rayon not found")
    rayon.nom = updated_rayon.nom
    rayon.code = updated_rayon.code
    return self.rayon_repo.save(rayon)

  # deleteRayon(id)  -> soft delete (supprimer = 1)
  def delete_rayon(self, id_: int) -> None:
    rayon = self.rayon_repo.find_by_id(id_)
    if not rayon:
      raise HTTPException(status_code=404, detail="Rayon not found")
    rayon.supprimer = 1
    self.rayon_repo.save(rayon)
