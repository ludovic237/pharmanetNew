from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.prescripteur import Prescripteur
from app.services.prescripteur_service import PrescripteurService

router = APIRouter(
  prefix="/api/prescripteurs",
  tags=["Prescripteurs"],
)

@router.post("/", response_model=Prescripteur, status_code=201)
def create_prescripteur(prescripteur: Prescripteur, db: Session = Depends(get_db)):
  return PrescripteurService(db).create_prescripteur(prescripteur)

@router.get("/", response_model=List[Prescripteur])
def get_all_prescripteurs(db: Session = Depends(get_db)):
  return PrescripteurService(db).get_all_prescripteurs()

@router.put("/{id}", response_model=Prescripteur)
def update_prescripteur(id: int, prescripteur: Prescripteur, db: Session = Depends(get_db)):
  updated = PrescripteurService(db).update_prescripteur(id, prescripteur)
  if not updated:
    raise HTTPException(status_code=404, detail="Prescripteur non trouvé")
  return updated

@router.delete("/{id}", status_code=204)
def delete_prescripteur(id: int, db: Session = Depends(get_db)):
  PrescripteurService(db).delete_prescripteur(id)
  return {"message": "Prescripteur supprimé"}
