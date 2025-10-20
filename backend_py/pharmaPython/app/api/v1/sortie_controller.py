from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import Any, Dict, Optional

from app.api.deps import get_db
from app.schemas.sortie_dto import SortieDetailDto
from app.services.sortie_stock_service import SortieStockService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(prefix="/sortie-stock", tags=["Sorties de stock"],  dependencies=[Depends(jwt_authentication)],)

# GET /
@router.get("")
def get_sortie_stock_pageable(
  nomProduit: Optional[str] = Query(None),
  typeSortie: Optional[str] = Query(None),
  enRayonId: Optional[str] = Query(None),
  startDate: Optional[str] = Query(None),
  endDate: Optional[str] = Query(None),
  produitDetailId: Optional[str] = Query(None),
  search: Optional[str] = Query(None),
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sort: str = Query("id"),
  direction: str = Query("desc"),
  db: Session = Depends(get_db),
):
  """
  Émule Page<Map<...>> Spring :
  renvoie {content, totalElements, totalPages, pageSize, pageNumber}
  Tri effectif par 'dateSortie' DESC comme en Kotlin.
  """
  svc = SortieStockService(db)
  en_rayon_id = int(enRayonId) if (enRayonId and enRayonId.isdigit()) else 0
  produit_detail_id = int(produitDetailId) if (produitDetailId and produitDetailId.isdigit()) else 0

  result = svc.get_sortie_stock_pageable(
    nom_produit=nomProduit,
    type_sortie=typeSortie,
    en_rayon_id=en_rayon_id,
    produit_detail_id=produit_detail_id,
    page=page,
    size=size,
  )
  total = result.get("totalElements", 0)
  result.update({
    "totalPages": (total + size - 1) // size if size else 1,
    "pageSize": size,
    "pageNumber": page,
    "sort": "dateSortie",
    "direction": "DESC",
  })
  return result

# GET /product
@router.get("/product")
def get_sortie_stock_pageable_product_range(
  nomProduit: Optional[str] = Query(None),
  produitId: Optional[str] = Query(None),
  supprimer: Optional[str] = Query(None),
  startDate: Optional[str] = Query(None),
  endDate: Optional[str] = Query(None),
  typeSortie: Optional[str] = Query(None),
  enRayonId: Optional[str] = Query(None),
  produitDetailId: Optional[str] = Query(None),
  search: Optional[str] = Query(None),
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sort: str = Query("id"),
  direction: str = Query("desc"),
  db: Session = Depends(get_db),
):
  svc = SortieStockService(
    db)
  en_rayon_id = int(enRayonId) if (enRayonId and enRayonId.isdigit()) else 0
  produit_detail_id = int(produitDetailId) if (produitDetailId and produitDetailId.isdigit()) else 0

  dto = svc.get_sortie_stock_pageable_product_range(
    nom_produit=nomProduit,
    produit_id=produitId,
    supprimer=supprimer,
    start_date=startDate,
    end_date=endDate,
    type_sortie=typeSortie,
    en_rayon_id=en_rayon_id,
    produit_detail_id=produit_detail_id,
    page=page,
    size=size,
  )
  # dto de type CommandePageableCustomlDto côté Kotlin → dict Python
  dto["pageNumber"] = page
  dto["pageSize"] = size
  dto["sort"] = "date_sortie"
  dto["direction"] = "DESC"
  return dto

# POST /save
@router.post("/save")
def add_sortie_stock(sortie: SortieDetailDto = Body(...), db: Session = Depends(get_db)):
  """
  Équivalent du POST /save Kotlin : ajoute une sortie sur un ProduitDetail.
  """
  svc = SortieStockService(db)
  return svc.add_produit_detail(sortie)
