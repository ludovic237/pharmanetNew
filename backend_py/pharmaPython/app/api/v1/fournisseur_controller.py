from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.fournisseur import Fournisseur
from app.services.fournisseur_service import FournisseurService

router = APIRouter(
  prefix="/api/fournisseurs",
  tags=["Fournisseurs"],
  # dependencies=[Depends(jwt_authentication)],
)

@router.post("/", response_model=Fournisseur, status_code=201)
def create_fournisseur(fournisseur: Fournisseur, db: Session = Depends(get_db)):
  return FournisseurService(db).create_fournisseur(fournisseur)

@router.get("/", response_model=List[Fournisseur])
def get_all_fournisseurs(db: Session = Depends(get_db)):
  return FournisseurService(db).get_all_fournisseurs()

@router.put("/{id}", response_model=Fournisseur)
def update_fournisseur(id: int, fournisseur: Fournisseur, db: Session = Depends(get_db)):
  updated = FournisseurService(db).update_fournisseur(id, fournisseur)
  if not updated:
    raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
  return updated

@router.delete("/{id}", status_code=204)
def delete_fournisseur(id: int, db: Session = Depends(get_db)):
  FournisseurService(db).delete_fournisseur(id)
  return {"message": "Fournisseur supprimé"}
