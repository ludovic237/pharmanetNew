# depense_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any, Dict, List

from app.api.deps import get_db
from app.models.depense import Depense, DepenseIn
from app.services.depense_service import DepenseService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/depenses",
  tags=["Depenses"],
  dependencies=[Depends(jwt_authentication)]  # équivalent de @PreAuthorize("isAuthenticated()")
)


@router.get("/")
def list_depenses(db: Session = Depends(get_db)):
  return DepenseService(db).get_all_depenses()


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
  full = DepenseService(db).get_all_depenses_pageable(page=page, size=size, sort=sortBy, direction="desc")

  return full


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
    return DepenseService(db).create_depense_map(db, depenseData)
  else:
    return DepenseService(db).create_depense(designation, prix_unitaire)


@router.put("/{id}", response_model=DepenseIn)
def update(id: int, depenseData: Dict[str, Any], db: Session = Depends(get_db)):
  designation = depenseData.get("designation")
  prix_unitaire = depenseData.get("prixUnitaire")

  if designation is None or not isinstance(designation, str):
    raise HTTPException(status_code=422, detail="Missing or invalid 'designation'")
  if prix_unitaire is None or not isinstance(prix_unitaire, int):
    raise HTTPException(status_code=422, detail="Missing or invalid 'prixUnitaire'")

  return DepenseService(db).update_depense(id, designation, prix_unitaire)


@router.delete("/{id}", status_code=204)
def delete(id: int, db: Session = Depends(get_db)):
  # tu peux faire une suppression logique si ton modèle la supporte
  dep:Depense = db.query(Depense).get(id)
  dep.supprimer = 1
  if not dep:
    raise HTTPException(status_code=404, detail="Dépense introuvable")
  db.commit()
  return {"message": "Deleted"}
