from fastapi import APIRouter, Depends, HTTPException, Path, Body, Query
from sqlalchemy.orm import Session
from typing import Any, Dict, List

from app.api.deps import get_db
from app.schemas.produit_retour import ProduitRetourRequestDto
from app.services.produit_service import ProduitService
from app.services.retour_produit_service import RetourProduitService

router = APIRouter(prefix="/api/retour-produits", tags=["Retour produits"])

# POST /retour/{venteId}
@router.post("/retour/{venteId}")
def retourner_produits_vendus_et_en_rayon(
  venteId: int = Path(..., ge=1),
  produitsRetour: List[ProduitRetourRequestDto] = Body(...),
  db: Session = Depends(get_db),
):
  try:
    return ProduitService(db, ...).retourner_produits_vendus_et_en_rayon(venteId, produitsRetour)
  except ValueError as e:
    # 400 Bad Request (IllegalArgumentException en Kotlin)
    raise HTTPException(status_code=400, detail=str(e))
  except Exception:
    # 500
    raise HTTPException(status_code=500, detail="Internal server error")

# GET /liste (pageable)
@router.get("/liste")
def lister_retour_produits_avec_details(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  db: Session = Depends(get_db),
):
  """
  Émule ResponseEntity<Page<Map<...>>> :
  renvoie {content, totalElements, totalPages, pageSize, pageNumber}
  """
  res = RetourProduitService(
    db,
    retour_produit_repo=..., produit_retour_repo=..., produit_repo=..., produit_detail_repo=..., enrayon_repo=...,
  ).lister_retour_produits_avec_details(page=page, size=size)

  total = res.get("totalElements", 0)
  res.update({
    "totalPages": (total + size - 1) // size if size else 1,
    "pageSize": size,
    "pageNumber": page,
  })
  return res
