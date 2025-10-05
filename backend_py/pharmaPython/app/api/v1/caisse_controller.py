from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.api.deps import get_db
from app.models.employe import Employe
from app.schemas.caisse_dto import CaisseClotureRequestDto, CaisseOuvertureRequestDto
from app.services.caisse_service import CaisseService
from app.utility.jwt_authentication import jwt_authentication
from app.utility.user_utils import UserUtils

router = APIRouter(
  prefix="/caisses",
  tags=["Caisse"],
  dependencies=[Depends(jwt_authentication)],
)


# ----------------------------
# Détails de la caisse active
# ----------------------------
@router.get("/active/details")
def get_active_caisse_details(db: Session = Depends(get_db)):
  service = CaisseService(db)
  active_caisse = service.get_caisse_active()
  if active_caisse:
    employe_name = active_caisse.user.user.nom if active_caisse.user else "Inconnu"
    return {
      "id": active_caisse.id,
      "etat": active_caisse.etat,
      "nomEmploye": employe_name,
      "dateOuvert": active_caisse.date_ouvert,
      "dateFerme": active_caisse.date_ferme
    }
  raise HTTPException(status_code=404, detail="Aucune caisse active trouvée")


# ----------------------------
# Vérifier si une caisse est ouverte
# ----------------------------
@router.get("/ouverte")
def is_caisse_ouverte(db: Session = Depends(get_db), employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CaisseService(db)
  caisse_active = service.get_caisse_active()
  caisse_en_cours = service.get_caisse_en_cours()
  last_caisse = service.get_last_caisse()
  employe_current_id = employe.id

  # ⚠️ Ici la logique détaillée Kotlin est très longue → à mapper selon besoin
  if last_caisse and last_caisse.etat == "Clot":
    return {"status": "close", "caisseDetails": None}
  elif caisse_active and caisse_active.user_id == employe_current_id:
    return {"status": "active", "caisseDetails": service.map_to_dto(caisse_active)}
  elif caisse_active:
    return {"status": "already", "caisseDetails": service.map_to_dto(caisse_active)}
  elif caisse_en_cours:
    return {"status": "open", "caisseDetails": service.map_to_dto(caisse_en_cours)}
  return {"status": "close", "caisseDetails": None}


# ----------------------------
# Mettre la caisse en attente de clôture
# ----------------------------
@router.put("/active/attente-cloture")
def set_caisse_to_pending_closure(db: Session = Depends(get_db),
                                  employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CaisseService(db)
  try:
    updated_caisse = service.set_caisse_to_pending_closure(employe)
    return {"message": "La caisse a été mise en attente de clôture.", "caisse": updated_caisse}
  except Exception as e:
    raise HTTPException(status_code=409, detail=str(e))


# ----------------------------
# Clôturer une caisse
# ----------------------------
@router.post("/cloturer")
def cloturer_caisse(request: CaisseClotureRequestDto, db: Session = Depends(get_db),
                    employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CaisseService(db)
  try:
    caisse_dto = service.cloturer_caisse(request.fond_caisse_ferme, request.fermeture_caisse, employe)
    return caisse_dto
  except Exception as e:
    raise HTTPException(status_code=409, detail=str(e))


# ----------------------------
# Mettre une caisse en attente (en cours)
# ----------------------------
@router.get("/en_cours")
def mettre_caisse_en_attente(db: Session = Depends(get_db), employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CaisseService(db)
  try:
    caisse_dto = service.mettre_caisse_en_attente(employe)
    return caisse_dto
  except Exception as e:
    raise HTTPException(status_code=409, detail=str(e))


# ----------------------------
# Ouvrir une nouvelle caisse
# ----------------------------
@router.post("/ouvrir")
def ouvrir_nouvelle_caisse(request: CaisseOuvertureRequestDto, db: Session = Depends(get_db),
                           employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CaisseService(db)
  # try:
  caisse_dto = service.ouvrir_nouvelle_caisse(request, employe)
  return caisse_dto
  # except Exception as e:
  #   raise HTTPException(status_code=409, detail=str(e))


# ----------------------------
# Récupérer détails d'une caisse en attente de clôture
# ----------------------------
@router.get("/cloture/details")
def get_caisse_closure_details(db: Session = Depends(get_db)):
  service = CaisseService(db)
  caisse_details = service.get_caisse_attente_cloture()
  if caisse_details:
    return caisse_details
  raise HTTPException(status_code=404, detail="Aucune caisse en attente de clôture trouvée")


# ----------------------------
# Rapport d'une caisse
# ----------------------------
@router.get("/{caisse_id}/rapport")
def get_caisse_report(caisse_id: int, db: Session = Depends(get_db)):
  service = CaisseService(db)
  return service.generate_caisse_report(caisse_id)


# ----------------------------
# Toutes les caisses (pagination)
# ----------------------------
@router.get("/all/pageable")
def get_all_caisses(page: int = Query(0), size: int = Query(10), db: Session = Depends(get_db)):
  service = CaisseService(db)
  return service.get_all_caisses(page=page, size=size)


# ----------------------------
# Filtrer les caisses (pagination)
# ----------------------------
@router.get("/all/filter")
def get_filtered_caisses(
  caisse_id: Optional[int] = None,
  start_date: Optional[str] = None,
  end_date: Optional[str] = None,
  page: int = Query(0),
  size: int = Query(10),
  db: Session = Depends(get_db)
):
  service = CaisseService(db)
  return service.get_filtered_caisses(caisse_id, start_date, end_date, page=page, size=size)
