from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple, Optional

from app.api.deps import get_db
from app.models.forme import Forme, FormeIn, FormeSchema, FormCreateSchema, FormeBaseSchema
from app.services.forme_service import FormeService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/formes",
  tags=["Formes"],
  dependencies=[Depends(jwt_authentication)],
)


@router.post("", response_model=FormeSchema,  status_code=201)
def create_forme(body: FormCreateSchema, db: Session = Depends(get_db)):
  return FormeService(db).create_forme(body)


@router.get("", response_model=List[FormeSchema])
def get_all_formes(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  db: Session = Depends(get_db)):
  return FormeService(db).get_all_formes()


@router.get("/pageable")
def get_all_formes_pageable(
  page: str = Query("0", ge="0"),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  search: Optional[str] = None,
  db: Session = Depends(get_db),
):
  """
  Équivalent d'un Page<Forme> : renvoie {content, totalElements, totalPages, pageSize, pageNumber, sortBy}.
  Tri descendant par défaut sur 'id', comme dans le contrôleur Kotlin.
  """
  if page == "NaN":
    page = "0"
  service = FormeService(db)
  return service.get_all_formes_page(page=int(page), size=size, search=search, sort_by=sortBy, direction="DESC")



@router.put("/{id}", response_model=FormeSchema)
def update_forme(id: int, forme: FormeBaseSchema, db: Session = Depends(get_db)):
  updated = FormeService(db).update_forme(id, forme)
  if not updated:
    raise HTTPException(status_code=404, detail="Forme non trouvée")
  return updated


@router.delete("/{id}", status_code=204)
def delete_forme(id: int, db: Session = Depends(get_db)):
  FormeService(db).delete_forme(id)
  return {"message": "Forme supprimée"}
