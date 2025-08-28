# controllers/fabriquant_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.api.deps import get_db
from app.models.fabriquant import Fabriquant
from app.services.fabriquant_service import FabriquantService

router = APIRouter(
  prefix="/api/fabriquants",
  tags=["Fabriquants"],
  # dependencies=[Depends(jwt_authentication)],
)

# ----------------------------
# Créer un fabriquant (201)
# ----------------------------
@router.post("/", response_model=Fabriquant, status_code=201)
def create_fabriquant(fabriquant: Fabriquant, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  return service.create_fabriquant(fabriquant)


# ----------------------------
# Lister tous les fabriquants
# ----------------------------
@router.get("/", response_model=List[Fabriquant])
def get_all_fabriquants(db: Session = Depends(get_db)):
  service = FabriquantService(db)
  return service.get_all_fabriquants()


# ----------------------------
# Lister paginé (pageable)
# ----------------------------
@router.get("/pageable")
def get_all_fabriquants_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db),
):
  """
  Équivalent de Page<Fabriquant> de Spring :
  on renvoie un objet {content, totalElements, totalPages, pageSize, pageNumber, sortBy}
  """
  service = FabriquantService(db)
  items, total = service.get_all_fabriquants_page(skip=page * size, limit=size, sort_by=sortBy, direction="DESC")
  total_pages = (total + size - 1) // size if size else 1

  return {
    "content": items,              # peut être list[Fabriquant] ou list[dict] selon ton service
    "totalElements": total,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sortBy": sortBy,
    "sortDir": "DESC",
  }


# ----------------------------
# Mettre à jour
# ----------------------------
@router.put("/{id}", response_model=Fabriquant)
def update_fabriquant(id: int, fabriquant: Fabriquant, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  updated = service.update_fabriquant(id, fabriquant)
  if not updated:
    raise HTTPException(status_code=404, detail="Fabriquant non trouvé")
  return updated


# ----------------------------
# Supprimer (204)
# ----------------------------
@router.delete("/{id}", status_code=204)
def delete_fabriquant(id: int, db: Session = Depends(get_db)):
  service = FabriquantService(db)
  service.delete_fabriquant(id)
  return {"message": "Fabriquant supprimé"}
