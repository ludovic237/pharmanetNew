from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.models.magasin import Magasin, MagasinSchema, MagasinIn
from app.services.magasin_service import MagasinService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/magasins",
  tags=["Magasins"],
  dependencies=[Depends(jwt_authentication)],
)


@router.post("", response_model=MagasinSchema, status_code=201)
def create_magasin(magasin: MagasinIn, db: Session = Depends(get_db)):
  return MagasinService(db).create_magasin(magasin)


@router.get("", response_model=List[MagasinSchema])
def get_all_magasins(db: Session = Depends(get_db)):
  return MagasinService(db).get_all_magasins()


@router.get("/pageable")
def get_all_magasins_pageable(
  page: int = Query(0, ge=0), size: int = Query(10, ge=1),
  search: Optional[str] = None,
  sortBy: str = Query("id"), db: Session = Depends(get_db),
):
  return MagasinService(db).get_all_magasins_page(page, size, sortBy, search=search)


@router.put("/{id}", response_model=MagasinSchema)
def update_magasin(id: int, magasin: MagasinIn, db: Session = Depends(get_db)):
  updated = MagasinService(db).update_magasin(id, magasin)
  if not updated:
    raise HTTPException(status_code=404, detail="Magasin non trouvé")
  return updated


@router.delete("/{id}", status_code=204)
def delete_magasin(id: int, db: Session = Depends(get_db)):
  MagasinService(db).delete_magasin(id)
  return {"message": "Magasin supprimé"}
