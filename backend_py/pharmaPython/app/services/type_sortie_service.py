# services/type_sortie_service.py
from sqlalchemy.orm import Session

from app.repositories.type_sortie_repository import TypeSortieRepository


class TypeSortieService:
  def __init__(self, db: Session):
    self.db = db
    self.type_sortie_repo = TypeSortieRepository(db)

  def get_type_sortie_pageable(self, nom: str, page: int, size: int):
    rows, total = self.type_sortie_repo.filter_type_sortie(nom, page, size)
    return {"content": [{"id": r.id, "nom": r.nom} for r in rows], "totalElements": total}

  def add_type_sortie(self, dto):
    if dto.id == 0:
      new = self.type_sortie_repo.save({"nom": dto.nom, "description": dto.description})
      return new
    else:
      ts = self.type_sortie_repo.find_by_id(dto.id)
      ts.nom = dto.nom
      ts.description = dto.description
      return self.type_sortie_repo.save(ts)
