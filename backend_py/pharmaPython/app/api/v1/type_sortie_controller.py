from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.api.deps import get_db
from app.models.type_sortie import TypeSortie, TypeSortieSchema
from app.schemas.type_sortie_dto import TypeSortieDto
from app.services.type_sortie_service import TypeSortieService

router = APIRouter(
  prefix="/api/type-sortie",
  tags=["TypeSortie"],
  # dependencies=[Depends(jwt_authentication)],
)

@router.get("/")
def get_type_sortie_pageable(
  nom: Optional[str] = Query(None),
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sort: str = Query("id"),
  direction: str = Query("desc"),
  db: Session = Depends(get_db),
) -> Dict[str, Any]:
  """
  Émule Page<Map<String,Any?>> Spring :
  retourne {content, totalElements, totalPages, pageSize, pageNumber, sort, direction}
  """
  svc = TypeSortieService(db, type_sortie_repo=... )
  result = svc.get_type_sortie_pageable(nom, page, size)  # renvoie {"content": [...], "totalElements": N}
  total = result.get("totalElements", 0)
  total_pages = (total + size - 1) // size if size else 1
  return {
    **result,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sort": sort,
    "direction": direction.upper(),
  }

@router.post("/save", response_model=TypeSortieSchema)
def save_type_sortie(sortie: TypeSortieDto, db: Session = Depends(get_db)):
  """
  Équivalent de addTypeSortiel(sortie) Kotlin.
  """
  return TypeSortieService(db, type_sortie_repo=... ).add_type_sortie(sortie)
