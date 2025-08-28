from fastapi import APIRouter, Depends, Query, Path, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_db
from app.schemas.produit_detail_dto import ProduitDetailDto
from app.services.produit_detail_service import ProduitDetailService

router = APIRouter(prefix="/api/produits-detail", tags=["Produits detail"])

@router.get("/info/{produitId}")
def get_produit_details_info(produitId: str, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).get_produit_details_info(produitId)

@router.get("/search")
def search_produit_details_by_name(nom: str, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).get_produit_details_by_name(nom)

@router.get("/search/pageable")
def search_produit_details_by_name_pageable(
  nom: Optional[str] = None,
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db),
):
  return ProduitDetailService(db, ...).get_produit_details_by_name_pageable(nom, page, size, sortBy)

@router.get("/list/pageable")
def get_produit_details_list(
  query: Optional[str] = None,
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db),
):
  return ProduitDetailService(db, ...).get_produit_details_pageable(query, page, size, sortBy)

@router.post("/add")
def create_produit_detail(produit: ProduitDetailDto, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).create_produit_detail(produit)

@router.post("/update/{produitDetailId}")
def update_produit_detail(produitDetailId: str, produit: ProduitDetailDto, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).update_produit_detail(produitDetailId, produit)

@router.get("/remove/prarent")
def remove_parent_detail(productId: str, productDetailId: str, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).remove_parent_detail(productId, productDetailId)

@router.get("/remove")
def remove_produit_detail(productDetailId: str, db: Session = Depends(get_db)):
  return ProduitDetailService(db, ...).remove_produit_detail(productDetailId)
