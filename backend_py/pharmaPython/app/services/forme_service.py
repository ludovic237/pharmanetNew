# services/forme_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Tuple, Optional, Dict, Any
from fastapi import HTTPException

from app.models.forme import Forme, FormeSchema, FormeIn, FormCreateSchema, FormeBaseSchema
from app.repositories.forme_repository import FormeRepository

def _page_tuple(page: int, size: int) -> Tuple[int, int]:
  return (max(0, int(page)), max(1, int(size)))


class FormeService:
  def __init__(self, db: Session):
    self.db = db
    self.forme_repo = FormeRepository(db)

  def create_forme(self, f: FormCreateSchema) -> FormeSchema:
    entity = Forme(**f.model_dump())
    entity.code = 'FOR'+str(int(self.db.query(Forme).count() + 2))
    entity = self.forme_repo.save(entity)
    return FormeSchema.model_validate(entity)

  def get_all_formes(self) -> List[Forme]:
    return self.db.query(Forme).all()

  def get_all_formes_page(self, page: int, size: int, sort_by: str = "id", direction: str = "DESC") -> Dict[str, Any]:
    page, size = _page_tuple(page, size)
    rows, total = self.forme_repo.find_all_pageable(
      page=page,
      size=size)
    content = rows
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageable":{
        "pageSize":size,
      },
      "pageNumber": page,
    }

  def update_forme(self, id_: int, data: FormeBaseSchema) -> Optional[Forme]:
    f = self.db.query(Forme).filter(Forme.id == id_).first()
    if not f: return None
    # mets à jour ici les champs nécessaires de Forme (ex.: nom, code)
    for attr in ["nom", "code"]:
      if hasattr(data, attr):
        setattr(f, attr, getattr(data, attr))
    self.db.commit();
    self.db.refresh(f);
    return f

  def delete_forme(self, id_: int) -> None:
    f:Forme = self.db.query(Forme).filter(Forme.id == id_).first()
    if not f: raise HTTPException(status_code=404, detail="Forme non trouvée")
    # self.db.delete(f);
    f.supprimer = 1
    self.db.commit()
