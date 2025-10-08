from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi_pagination import Page, paginate, Params
from fastapi_pagination.ext.sqlalchemy import paginate as sa_paginate

from app.api.deps import get_db
from app.models.categorie import Categorie, CategorieSchema, CategorieCreateSchema
from app.schemas.page_custom import PageCustom
from app.services.categorie_service import CategorieService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/categories",
  tags=["Categorie"],
  dependencies=[Depends(jwt_authentication)],
)


# ----------------------------
# Créer une catégorie
# ----------------------------
@router.post("/", response_model=CategorieSchema, status_code=201)
def create_categorie(categorie: CategorieCreateSchema, db: Session = Depends(get_db)):
  service = CategorieService(db)
  return service.create_categorie(categorie)


# ----------------------------
# Récupérer toutes les catégories
# ----------------------------
@router.get("/", response_model=List[CategorieSchema])
def get_all_categories(db: Session = Depends(get_db)):
  service = CategorieService(db)
  return service.get_all_categories()


# ----------------------------
# Récupérer toutes les catégories (pageable)
# ----------------------------
# @router.get("/pageable", response_model=Page[CategorieSchema])
# def get_all_categories_pageable(
#   page: int = Query(0, ge=0),
#   size: int = Query(10, ge=1),
#   db: Session = Depends(get_db)
# ):
#   service = CategorieService(db)
#   categories = service.get_all_categories()
#   return paginate(categories)

class ZeroParams(Params):
  # page commence à 0 au lieu de 1
  page: int = Field(0, ge=0, description="0-based page number")


@router.get("/pageable", response_model=PageCustom[CategorieSchema])
def get_all_categories_pageable(
  zparams: ZeroParams = Depends(),  # <- accepte page>=0
  db: Session = Depends(get_db),
) -> Dict[str, Any]:
  # convertir vers Params 1-based attendu par fastapi_pagination
  params = Params(page=zparams.page + 1, size=zparams.size)
  query = db.query(Categorie).order_by(Categorie.id.desc())
  page_obj = sa_paginate(db, query, params)
  content: List[Dict[str, Any]] = [
    CategorieSchema.model_validate(c, from_attributes=True).model_dump()
    for c in page_obj.items
  ]
  # return page_obj
  return {
    "content": content,
    "totalElements": page_obj.total,  # nb total d’éléments (toutes pages)
    "totalPages": page_obj.pages,  # nb total de pages
    "pageSize": page_obj.size,  # taille de page
    "pageable":{
      "pageSize":page_obj.size,
      "totalElements": page_obj.total,  # nb total d’éléments (toutes pages)
      "totalPages": page_obj.pages,  # nb total de pages
      "pageNumber": page_obj.page,  # taille de page
    },
    "pageNumber": page_obj.page,  # page courante (1-based)
  }


# ----------------------------
# Mettre à jour une catégorie
# ----------------------------
@router.put("/{id}", response_model=CategorieSchema)
def update_categorie(id: int, categorie: CategorieCreateSchema, db: Session = Depends(get_db)):
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
