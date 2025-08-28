from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from fastapi_pagination import Page, paginate

from app.api.deps import get_db
from app.models.categorie import Categorie
from app.services.categorie_service import CategorieService

router = APIRouter(
  prefix="/api/categories",
  tags=["Categorie"]
)

# ----------------------------
# Créer une catégorie
# ----------------------------
@router.post("/", response_model=Categorie, status_code=201)
def create_categorie(categorie: Categorie, db: Session = Depends(get_db)):
  service = CategorieService(db)
  return service.create_categorie(categorie)


# ----------------------------
# Récupérer toutes les catégories
# ----------------------------
@router.get("/", response_model=List[Categorie])
def get_all_categories(db: Session = Depends(get_db)):
  service = CategorieService(db)
  return service.get_all_categories()


# ----------------------------
# Récupérer toutes les catégories (pageable)
# ----------------------------
@router.get("/pageable", response_model=Page[Categorie])
def get_all_categories_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  db: Session = Depends(get_db)
):
  service = CategorieService(db)
  categories = service.get_all_categories()
  return paginate(categories)


# ----------------------------
# Mettre à jour une catégorie
# ----------------------------
@router.put("/{id}", response_model=Categorie)
def update_categorie(id: int, categorie: Categorie, db: Session = Depends(get_db)):
  service = CategorieService(db)
  updated = service.update_categorie(id, categorie)
  if not updated:
    raise HTTPException(status_code=404, detail="Catégorie non trouvée")
  return updated


# ----------------------------
# Supprimer une catégorie
# ----------------------------
@router.delete("/{id}", status_code=204)
def delete_categorie(id: int, db: Session = Depends(get_db)):
  service = CategorieService(db)
  service.delete_categorie(id)
  return {"message": "Catégorie supprimée"}
