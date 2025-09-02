# controllers/fabriquant_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.fabriquant import Fabriquant, FabriquantSchema, FabriquantIn
from app.services.fabriquant_service import FabriquantService

router = APIRouter(prefix="/fabriquants", tags=["Fabriquants"])


@router.post("/", response_model=FabriquantSchema, status_code=201)
def create_fabriquant(body: FabriquantIn, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  # construire l'entité ORM à partir du schéma d'entrée
  ent = Fabriquant(
    code=body.code,
    nom=body.nom,
    adresse=body.adresse,
    telephone=body.telephone,
    email=body.email,
    codepostal=body.codepostal,
    supprimer=0,
  )
  return service.create_fabriquant(ent)



@router.get("/")
def get_all_fabriquants(db: Session = Depends(get_db)):
  service = FabriquantService(db)
  return service.get_all_fabriquants()  # ORM -> sérialisé grâce à from_attributes


@router.get("/pageable")
def get_all_fabriquants_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db),
):
  service = FabriquantService(db)
  items, total = service.get_all_fabriquants_page(
    skip=page * size, limit=size, sort_by=sortBy, direction="DESC"
  )
  total_pages = (total + size - 1) // size if size else 1
  return {
    "content": items,              # retourne des ORM : OK (pas de response_model ici)
    "totalElements": total,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sortBy": sortBy,
    "sortDir": "DESC",
  }


@router.put("/{id}", response_model=FabriquantSchema)
def update_fabriquant(id: int, body: FabriquantIn, db: Session = Depends(get_db)):
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
