from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional

from app.api.deps import get_db
from app.schemas.produit_detail_dto import ProduitRequestDto, ProduitResponseNewDto, \
  ProduitTarificationUpdateRequestDto, CategorieDto, FournisseurDto, RayonDto, ProduitRequestNewDto, \
  ProduitStockUpdateRequestDto
from app.services.produit_service import ProduitService

router = APIRouter(prefix="/api/produits", tags=["Produits"])

@router.post("/", status_code=201)
def create_produit(request: ProduitRequestDto, db: Session = Depends(get_db)):
  try:
    return ProduitService(db, ...).create_produit(request)
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))

@router.post("/new", status_code=201)
def create_produit_new(request: ProduitResponseNewDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).create_produit_new(request)

@router.get("/{id}")
def get_produit_by_id(id: int, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_produit_by_id(id)

@router.get("/{id}/map")
def get_produit_by_id_map(id: int, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_produit_by_id_map(id)

@router.get("/{id}/info")
def get_produit_detail_by_id(id: int, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_produit_detail_by_id(id)

@router.get("/{id}/info/en_rayon")
def get_produit_enrayon_detail_by_id(id: int, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_produit_enrayon_detail_by_id(id)

@router.get("/{id}/info/scan/en_rayon")
def get_enrayon_detail_by_id(id: str, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_enrayon_detail_by_id(id)

@router.get("/")
def get_all_produits(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db)
):
  return ProduitService(db, ...).get_all_produits(page, size)

@router.get("/products/search")
def search_products(query: str, page: int = 0, size: int = 10, db: Session = Depends(get_db)):
  return ProduitService(db, ...).search_products(query, page, size)

@router.get("/products/search/param")
def search_products_param(
  query: Optional[str] = None, page: int = 0, size: int = 10,
  rayonId: Optional[str] = None, fabriquantId: Optional[str] = None,
  etagereId: Optional[str] = None, formeId: Optional[str] = None,
  magasinId: Optional[str] = None, categorieId: Optional[str] = None,
  db: Session = Depends(get_db)
):
  return ProduitService(db, ...).search_products_with_param(
    query=query, page=page, size=size,
    rayonId=rayonId, fabriquantId=fabriquantId, etagereId=etagereId,
    formeId=formeId, magasinId=magasinId, categorieId=categorieId
  )

@router.put("/{id}")
def update_produit(id: int, request: ProduitRequestDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).update_produit(id, request)

@router.put("/{id}/save")
def add_or_update_produit_new(id: int, request: ProduitRequestNewDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).add_or_update_produit_new(id, request)

@router.delete("/{id}", status_code=204)
def delete_produit(id: int, db: Session = Depends(get_db)):
  ProduitService(db, ...).delete_produit(id)
  return {"message": "deleted"}

@router.post("/{id}/stock")
def update_stock_produit(id: int, request: ProduitStockUpdateRequestDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).update_stock_produit(id, request)

@router.post("/{id}/tarification")
def update_tarification_produit(id: int, request: ProduitTarificationUpdateRequestDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).update_tarification_produit(id, request)

@router.post("/categories", status_code=201)
def create_categorie(dto: CategorieDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).create_categorie(dto)

@router.get("/categories")
def get_all_categories(db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_all_categories()

@router.post("/fournisseurs", status_code=201)
def create_fournisseur(dto: FournisseurDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).create_fournisseur(dto)

@router.get("/fournisseurs")
def get_all_fournisseurs(db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_all_fournisseurs()

@router.post("/rayons", status_code=201)
def create_rayon(dto: RayonDto, db: Session = Depends(get_db)):
  return ProduitService(db, ...).create_rayon(dto)

@router.get("/rayons")
def get_all_rayons(db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_all_rayons()

@router.get("/{id}/details")
def get_produit_details(id: int, db: Session = Depends(get_db)):
  return ProduitService(db, ...).get_produit_details(id)
