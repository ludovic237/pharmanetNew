# controllers/fabriquant_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.models.fabriquant import FabriquantCreateSchema, FabriquantSchema, FabriquantBaseSchema
from app.services.fabriquant_service import FabriquantService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(prefix="/fabriquants", tags=["Fabriquants"], dependencies=[Depends(jwt_authentication)], )


@router.post("", response_model=FabriquantSchema, status_code=201)
def create_fabriquant(body: FabriquantCreateSchema, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  return service.create_fabriquant(body)


@router.get("")
def get_all_fabriquants(db: Session = Depends(get_db)):
  service = FabriquantService(db)
  return service.get_all_fabriquants()  # ORM -> sérialisé grâce à from_attributes


@router.get("/pageable")
def get_all_fabriquants_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  search: Optional[str] = None,
  db: Session = Depends(get_db),
):
  service = FabriquantService(db)
  items, total = service.get_all_fabriquants_page(
    skip=page * size, limit=size, sort_by=sortBy, direction="DESC",search=search
  )
  total_pages = (total + size - 1) // size if size else 1
  return {
    "content": items,  # retourne des ORM : OK (pas de response_model ici)
    "totalElements": total,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sortBy": sortBy,
    "sortDir": "DESC",
  }


@router.put("/{id}", response_model=FabriquantSchema)
def update_fabriquant(id: int, body: FabriquantBaseSchema, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  updated = service.update_fabriquant(id, body)  # laisse le service faire le mapping
  if not updated:
    raise HTTPException(status_code=404, detail="Fabriquant non trouvé")
  return updated


@router.delete("/{id}", status_code=204)
def delete_fabriquant(id: int, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  service.delete_fabriquant(id)
  return {"message": "Fabriquant supprimé"}
