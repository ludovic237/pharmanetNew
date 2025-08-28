# depense_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any, Dict, List


from app.api.deps import get_db
from app.models.depense import Depense, DepenseIn
from app.services.depense_service import DepenseService

router = APIRouter(
  prefix="/api/depenses",
  tags=["Depenses"],
  # dependencies=[Depends(jwt_authentication)]  # équivalent de @PreAuthorize("isAuthenticated()")
)

@router.get("/", response_model=List[DepenseIn])
def list_depenses(db: Session = Depends(get_db)):
  return DepenseService.get_all_depenses(db)


@router.get("/pageable")
def list_depenses_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("dateDepense"),
  db: Session = Depends(get_db),
):
  """
  Équivalent de: Page<Map<String, Any?>> avec tri DESC sur dateDepense par défaut.
  On renvoie un objet de pagination simple et la liste mappée.
  """
  full = DepenseService.get_all_depenses_pageable(db, skip=page * size, limit=size)

  # Si tu veux un vrai total/nb pages, rajoute une méthode count() côté service/repo :
  total_elements = len(full) if len(full) < size else (page + 1) * size  # approximation si pas de count
  total_pages = page + (1 if len(full) == size else 0)

  return {
    "content": full,                 # List[Dict[str, Any]]
    "totalElements": total_elements,
    "totalPages": total_pages,
    "pageSize": size,
    "pageNumber": page,
    "sortBy": sortBy,
    "sortDir": "DESC",
  }


@router.post("/", response_model=DepenseIn)
def create(depenseData: Dict[str, Any], db: Session = Depends(get_db)):
  """
  Kotlin: si la map contient > 3 champs → createDepenseMap, sinon createDepense(designation, prixUnitaire)
  """
  designation = depenseData.get("designation")
  prix_unitaire = depenseData.get("prixUnitaire")

  if designation is None or not isinstance(designation, str):
    raise HTTPException(status_code=422, detail="Missing or invalid 'designation'")
  if prix_unitaire is None or not isinstance(prix_unitaire, int):
    raise HTTPException(status_code=422, detail="Missing or invalid 'prixUnitaire'")

  if len(depenseData) > 3:
    return DepenseService.create_depense_map(db, depenseData)
  else:
    return DepenseService.create_depense(db, designation, prix_unitaire)


@router.put("/{id}", response_model=DepenseIn)
def update(id: int, depenseData: Dict[str, Any], db: Session = Depends(get_db)):
  designation = depenseData.get("designation")
  prix_unitaire = depenseData.get("prixUnitaire")

  if designation is None or not isinstance(designation, str):
    raise HTTPException(status_code=422, detail="Missing or invalid 'designation'")
  if prix_unitaire is None or not isinstance(prix_unitaire, int):
    raise HTTPException(status_code=422, detail="Missing or invalid 'prixUnitaire'")

  return DepenseService.update_depense(db, id, designation, prix_unitaire)


@router.delete("/{id}", status_code=204)
def delete(id: int, db: Session = Depends(get_db)):
  # tu peux faire une suppression logique si ton modèle la supporte
  dep = db.query(Depense).filter(Depense.id == id).first()
  if not dep:
    raise HTTPException(status_code=404, detail="Dépense introuvable")
  db.delete(dep)
  db.commit()
  return {"message": "Deleted"}
