from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple

from app.api.deps import get_db
from app.models.forme import Forme, FormeIn, FormeSchema
from app.services.forme_service import FormeService

router = APIRouter(
  prefix="/api/formes",
  tags=["Formes"],
  # dependencies=[Depends(jwt_authentication)],
)

@router.post("/", response_model=FormeSchema, status_code=201)
def create_forme(body: FormeIn, db: Session = Depends(get_db)):
  ent = Forme(
    code=body.code,
    nom=body.nom,
    supprimer=0,
  )
  return FormeService(db).create_forme(ent)

@router.get("/", response_model=List[FormeSchema])
def get_all_formes(db: Session = Depends(get_db)):
  return FormeService(db).get_all_formes()

@router.get("/pageable")
def get_all_formes_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db),
):
  """
  Équivalent d'un Page<Forme> : renvoie {content, totalElements, totalPages, pageSize, pageNumber, sortBy}.
  Tri descendant par défaut sur 'id', comme dans le contrôleur Kotlin.
  """
  service = FormeService(db)
  content, total = service.get_all_formes_page(skip=page * size, limit=size, sort_by=sortBy, direction="DESC")
  total_pages = (total + size - 1) // size if size else 1
  return {
    "content": content,
    "totalElements": total,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sortBy": sortBy,
    "sortDir": "DESC",
  }

@router.put("/{id}", response_model=FormeSchema)
def update_forme(id: int, forme: FormeIn, db: Session = Depends(get_db)):
  updated = FormeService(db).update_forme(id, forme)
  if not updated:
    raise HTTPException(status_code=404, detail="Forme non trouvée")
  return updated

@router.delete("/{id}", status_code=204)
def delete_forme(id: int, db: Session = Depends(get_db)):
  FormeService(db).delete_forme(id)
  return {"message": "Forme supprimée"}
