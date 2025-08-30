# controllers/vente_controller.py
from __future__ import annotations
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.vente_dto import VenteRequestDto, EncaissementDirectDto, VentePageableCustomlDto, EncaissementDto
from app.services.produit_service import ProduitService
from app.services.vente_service import VenteService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/ventes",
  tags=["Ventes"],
  dependencies=[Depends(jwt_authentication)],
)


# -----------------------------
# Helpers
# -----------------------------
def _page_size(page: str = "0", size: str = "10") -> tuple[int, int]:
  p = int(page) if page.isdigit() and int(page) >= 0 else 0
  s = int(size) if size.isdigit() and int(size) >= 1 else 10
  return p, s


# -----------------------------
# POST /creer-sans-encaissement
# -----------------------------
@router.post("/creer-sans-encaissement")
def creer_vente_sans_encaissement(
  venteRequestDto: VenteRequestDto, db: Session = Depends(get_db)
):
  service = VenteService(db)
  return service.creer_vente_sans_encaissement(venteRequestDto)


# -----------------------------
# POST /{venteId}/encaisser
# (en Kotlin, venteId n'est pas utilisé dans le service)
# -----------------------------
@router.post("/{venteId}/encaisser")
def encaisser_vente(
  venteId: int = Path(...),
  encaissementRequestDto: EncaissementDto = Body(...),
  db: Session = Depends(get_db),
):
  service = VenteService(db)
  return service.encaisser_vente(encaissementRequestDto)


# -----------------------------
# POST /encaisser_direct
# -----------------------------
@router.post("/encaisser_direct")
def encaisser_vente_direct(
  encaissementDirectDto: EncaissementDirectDto, db: Session = Depends(get_db)
):
  return VenteService(db).encaisser_vente_direct(encaissementDirectDto)


# -----------------------------
# GET /{venteId}/non-encaissee
# -----------------------------
@router.get("/{venteId}/non-encaissee")
def charger_ventes_en_cours_non_encaisser(
  venteId: int, db: Session = Depends(get_db)
):
  return VenteService(db).charger_ventes_en_cours_non_encaisser(venteId)


# -----------------------------
# GET /{venteId}/supprimer
# -----------------------------
@router.get("/{venteId}/supprimer")
def supprimer_vente(venteId: int, db: Session = Depends(get_db)):
  return VenteService(db).supprimer_vente(venteId)


# -----------------------------
# GET /vente-non-encaissees (page de maps)
# -----------------------------
@router.get("/vente-non-encaissees")
def lister_ventes_non_encaissees(
  page: str = Query("0"),
  size: str = Query("10"),
  sortBy: str = Query("id"),
  search: Optional[str] = Query(None),
  db: Session = Depends(get_db),
):
  p, s = _page_size(page, size)
  # tri forcé par dateVente desc comme en Kotlin
  return VenteService(db).lister_ventes_non_encaissees(
    page=p, size=s, sort="dateVente", direction="DESC", search=search
  )


# -----------------------------
# GET /lister (liste de maps)
# -----------------------------
@router.get("/lister")
def lister_ventes(
  db: Session = Depends(get_db),
):
  service = VenteService(
    db=db,
  )
  return service.lister_ventes()


# -----------------------------
# GET /pageable/lister (dto custom)
# -----------------------------
@router.get("/pageable/lister", response_model=VentePageableCustomlDto)
def lister_pageable_ventes(
  page: str = "0",
  size: str = "10",
  sortBy: str = "dateVente",
  direction: str = "DESC",
  search: Optional[str] = None,
  etat: Optional[str] = None,
  startDateVente: Optional[str] = None,
  endDateVente: Optional[str] = None,
  startDateEncaissement: Optional[str] = None,
  endDateEncaissement: Optional[str] = None,
  userId: Optional[str] = None,
  employeId: Optional[str] = None,
  prescripteurId: Optional[str] = None,
  caisseId: Optional[str] = None,
  db: Session = Depends(get_db),
):
  p = int(page) if page.isdigit() and int(page) >= 0 else 0
  s = int(size) if size.isdigit() and int(size) > 0 else 10

  service = VenteService(db)  # ✅ plus simple : le service crée ses repos

  return service.lister_ventes_pageable_detail(
    page=p, size=s, sort=sortBy, direction=direction,
    etat=etat,
    startDateVente=startDateVente, endDateVente=endDateVente,
    startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
    userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
    search=search,
  )


# -----------------------------
# GET /product/pageable/lister (par produit)
# -----------------------------
@router.get("/product/pageable/lister", response_model=VentePageableCustomlDto)
def lister_pageable_ventes_by_produit(
  page: str = "0",
  size: str = "10",
  sortBy: str = "id",
  search: Optional[str] = None,
  etat: Optional[str] = None,
  produitId: Optional[str] = None,
  startDateVente: Optional[str] = None,
  endDateVente: Optional[str] = None,
  startDateEncaissement: Optional[str] = None,
  endDateEncaissement: Optional[str] = None,
  userId: Optional[str] = None,
  employeId: Optional[str] = None,
  prescripteurId: Optional[str] = None,
  caisseId: Optional[str] = None,
  db: Session = Depends(get_db),
):
  p, s = _page_size(page, size)
  return VenteService(db).lister_ventes_pageable_detail_by_produit(
    page=p, size=s, sort="dateVente", direction="DESC",
    etat=etat, produitId=produitId,
    startDateVente=startDateVente, endDateVente=endDateVente,
    startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
    userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
    search=search,
  )


# -----------------------------
# GET /pageable/lister/print (PDF)
# -----------------------------
@router.get("/pageable/lister/print")
def lister_pageable_ventes_print(
  page: str = "0",
  size: str = "10",
  sortBy: str = "id",
  search: Optional[str] = None,
  etat: Optional[str] = None,
  startDateVente: Optional[str] = None,
  endDateVente: Optional[str] = None,
  startDateEncaissement: Optional[str] = None,
  endDateEncaissement: Optional[str] = None,
  userId: Optional[str] = None,
  employeId: Optional[str] = None,
  prescripteurId: Optional[str] = None,
  caisseId: Optional[str] = None,
  db: Session = Depends(get_db),
):
  p, s = _page_size(page, size)
  output_path = "vente.pdf"
  VenteService(db).lister_ventes_pageable_detail_print(
    page=p, size=s, sort="dateVente", direction="DESC",
    etat=etat,
    startDateVente=startDateVente, endDateVente=endDateVente,
    startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
    userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
    search=search,
    output_path=output_path,
  )

  # renvoie le PDF en streaming et supprime le fichier temporaire côté service
  def _iterfile():
    with open(output_path, "rb") as f:
      yield from f

  headers = {"Content-Disposition": f'attachment; filename="{output_path}"'}
  return StreamingResponse(_iterfile(), media_type="application/pdf", headers=headers)


# -----------------------------
# GET /vente-encaissee
# -----------------------------
@router.get("/vente-encaissee")
def lister_ventes_encaissees(
  page: str = "0",
  size: str = "10",
  sortBy: str = "id",
  search: Optional[str] = None,
  db: Session = Depends(get_db),
):
  p, s = _page_size(page, size)
  return VenteService(db).lister_ventes_encaissees(
    page=p, size=s, sort="dateVente", direction="DESC", search=search
  )


# -----------------------------
# GET /{venteId}/encaissee
# -----------------------------
@router.get("/{venteId}/encaissee")
def charger_ventes_encaisser(venteId: int, db: Session = Depends(get_db)):
  return VenteService(db).charger_ventes_encaisser(venteId)


# -----------------------------
# GET /{venteId}/envoyer_caisse
# -----------------------------
@router.get("/{venteId}/envoyer_caisse")
def envoyer_vente_credit_en_caisse(venteId: str, db: Session = Depends(get_db)):
  return VenteService(db).envoyer_vente_credit_en_caisse(venteId)


# -----------------------------
# POST /retour/{venteId}
# -----------------------------
@router.post("/retour/{venteId}")
def retourner_produits_vendus_et_en_rayon(
  venteId: int,
  produitsRetour: List[Dict[str, Any]],
  db: Session = Depends(get_db),
):
  try:
    return ProduitService(db).retourner_produits_vendus_et_en_rayon(venteId, produitsRetour)
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
  except Exception:
    raise HTTPException(status_code=500, detail="Internal server error")


# -----------------------------
# GET /details/{reference}
# -----------------------------
@router.get("/details/{reference}")
def get_vente_details_by_reference(reference: str, db: Session = Depends(get_db)):
  try:
    return VenteService(db).get_vente_details_by_reference(reference)
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
  except Exception:
    raise HTTPException(status_code=500, detail="Internal server error")


# -----------------------------
# GET /vente-non-encaissees/credit
# -----------------------------
@router.get("/vente-non-encaissees/credit")
def lister_ventes_credit_non_encaissees(
  page: str = "0",
  size: str = "10",
  sortBy: str = "id",
  search: Optional[str] = None,
  db: Session = Depends(get_db),
):
  p, s = _page_size(page, size)
  return VenteService(db).lister_ventes_credit_non_encaissees(
    page=p, size=s, sort="dateVente", direction="DESC", search=search
  )


# -----------------------------
# GET /nombre-jour-fournisseur
# -----------------------------
@router.get("/nombre-jour-fournisseur")
def lister_vente_par_nombre_de_jour_et_fournisseur(
  fournisseurId: Optional[str] = Query(None),
  jour: str = Query("14"),
  db: Session = Depends(get_db),
):
  try:
    jours = int(jour)
  except ValueError:
    raise HTTPException(status_code=422, detail="Paramètre 'jour' invalide")
  return VenteService(db).lister_vente_par_nombre_de_jour_et_fournisseur(fournisseurId, jours)
