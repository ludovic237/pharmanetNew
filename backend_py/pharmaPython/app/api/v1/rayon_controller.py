from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.rayon import Rayon, RayonSchema, RayonIn
from app.services.rayon_service import RayonService

router = APIRouter(prefix="/rayons", tags=["Rayons"])


@router.post("/", status_code=201, response_model=RayonSchema)
def create_rayon(rayon: RayonIn, db: Session = Depends(get_db)):
  return RayonService(db, ...).create_rayon(rayon)


@router.get("/", response_model=List[RayonSchema])
def get_all_rayons(db: Session = Depends(get_db)):
  return RayonService(db, ...).get_all_rayons()


@router.get("/pageable")
def get_all_rayons_pageable(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  sortBy: str = Query("id"),
  db: Session = Depends(get_db)
):
  return RayonService(db, ...).get_all_rayons_page(page, size, sortBy)


@router.put("/{id}", response_model=RayonSchema)
def update_rayon(id: int, rayon: RayonIn, db: Session = Depends(get_db)):
  return RayonService(db, ...).update_rayon(id, rayon)


@router.delete("/{id}", status_code=204)
def delete_rayon(id: int, db: Session = Depends(get_db)):
  RayonService(db, ...).delete_rayon(id)
  return {"message": "deleted"}
