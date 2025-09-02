from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from pydantic import BaseModel

from app.api.deps import get_db
from app.models.bon_caisse import BonCaisse, BonCaisseSchema
from app.services.bon_caisse_service import BonCaisseService


# ----------------------------
# DTO équivalent à BonCaisseData
# ----------------------------
class BonCaisseData(BaseModel):
  nomClient: str
  montant: int


router = APIRouter(
  prefix="/admin/bons",
  tags=["BonCaisse"]
)


# ----------------------------
# Récupérer tous les bons
# ----------------------------
@router.get("/")
def get_all_bons(db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  return service.get_all_bons()


# ----------------------------
# Récupérer un bon par ID
# ----------------------------
@router.get("/{id}", response_model=BonCaisseSchema)
def get_bon_by_id(id: int, db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  bon = service.get_bon_by_id(id)
  if not bon:
    raise HTTPException(status_code=404, detail="Bon non trouvé")
  return bon


# ----------------------------
# Récupérer un bon par code-barres
# ----------------------------
@router.get("/codebarre/{codebarre_id}", response_model=BonCaisseSchema)
def get_bon_by_codebarre_id(codebarre_id: str, db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  return service.get_bon_by_codebarre_id(codebarre_id)


# ----------------------------
# Créer un bon
# ----------------------------
@router.post("/", response_model=BonCaisseSchema)
def create_bon(bon: BonCaisseData, db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  return service.create_bon(bon)


# ----------------------------
# Mettre à jour un bon (via codebarre)
# ----------------------------
@router.put("/{codebarre_id}", response_model=BonCaisseSchema)
def update_bon(codebarre_id: str, db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  return service.update_bon(codebarre_id)


# ----------------------------
# Supprimer un bon
# ----------------------------
@router.delete("/{id}", status_code=204)
def delete_bon(id: int, db: Session = Depends(get_db)):
  service = BonCaisseService(db)
  service.delete_bon(id)
  return {"message": "Bon supprimé"}
