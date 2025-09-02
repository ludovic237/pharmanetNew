# repositories/sortie_stock_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from app.models.sortie_stock import SortieStock
from app.models.en_rayon import EnRayon
from app.models.produit_detail import ProduitDetail
from app.models.produit import Produit  # si sortie.produit.nom est utilisé


class SortieStockRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all_pageable(self, page: int, size: int) -> Tuple[List[SortieStock], int]:
    q = self.db.query(SortieStock)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total


  # ---- filterSortieStockRange(...) avec pagination ----
  def filter_sortie_stock_range(
    self,
    nom_produit: Optional[str] = None,
    produit_id: Optional[str] = None,
    supprimer: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    type_sortie: Optional[str] = None,
    en_rayon_id: Optional[int] = None,
    produit_detail_id: Optional[int] = None,
    page: int = 0,
    size: int = 10,
    sort_by: str = "date_sortie",
    direction: str = "DESC",
  ) -> Tuple[List[SortieStock], int]:
    q = (
      self.db.query(SortieStock)
      .options(
        joinedload(SortieStock.en_rayon),
        # joinedload(SortieStock.produit_detail),
        # joinedload(SortieStock.produit),  # si modèle le permet
      )
    )

    if nom_produit and nom_produit != "null":
      q = q.join(SortieStock.en_rayon.produit.nom).filter(
        func.lower(Produit.nom).like(f"%{nom_produit.lower()}%")
      )

    if supprimer and supprimer != "null":
      q = q.filter(SortieStock.supprimer == int(supprimer))

    if produit_id and produit_id != "null":
      # côté Kotlin: root.get<Long>("enRayon").get<Long>("produitId")
      q = q.join(SortieStock.en_rayon).filter(EnRayon.produit_id == int(produit_id))

    if start_date and start_date.strip().lower() != "null":
      start_dt = datetime.fromisoformat(start_date.strip())
      q = q.filter(SortieStock.date_sortie >= start_dt)

    if end_date and end_date.strip().lower() != "null":
      end_dt = datetime.fromisoformat(end_date.strip())
      q = q.filter(SortieStock.date_sortie <= end_dt)

    if type_sortie and type_sortie != "null":
      q = q.filter(SortieStock.type_sortie == type_sortie)

    if en_rayon_id and en_rayon_id != 0:
      q = q.filter(SortieStock.en_rayon_id == int(en_rayon_id))

    if produit_detail_id and produit_detail_id != 0:
      q = q.filter(SortieStock.detail_id == int(produit_detail_id))

    total = q.count()
    col = getattr(SortieStock, sort_by, SortieStock.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total


  # ---- filterSortieStock(...) (sans plage de dates) ----
  def filter_sortie_stock(
    self,
    nom_produit: Optional[str] = None,
    type_sortie: Optional[str] = None,
    en_rayon_id: Optional[int] = None,
    produit_detail_id: Optional[int] = None,
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[SortieStock], int]:
    q = (
      self.db.query(SortieStock)
      .options(
        joinedload(SortieStock.en_rayon),
        joinedload(SortieStock.produit_detail),
        joinedload(SortieStock.produit),
      )
    )

    if nom_produit and nom_produit != "null":
      q = q.join(SortieStock.produit).filter(
        func.lower(Produit.nom).like(f"%{nom_produit.lower()}%")
      )

    if type_sortie and type_sortie != "null":
      q = q.filter(SortieStock.type_sortie == type_sortie)

    if en_rayon_id and en_rayon_id != 0:
      q = q.filter(SortieStock.en_rayon_id == int(en_rayon_id))

    if produit_detail_id and produit_detail_id != 0:
      q = q.filter(SortieStock.produit_detail_id == int(produit_detail_id))

    total = q.count()
    col = getattr(SortieStock, sort_by, SortieStock.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total


  # helpers CRUD
  def find_by_id(self, id_: int) -> Optional[SortieStock]:
    return self.db.query(SortieStock).get(id_)


  def save(self, entity: SortieStock) -> SortieStock:
    self.db.add(entity);
    self.db.commit();
    self.db.refresh(entity);
    return entity


  def delete(self, entity: SortieStock) -> None:
    self.db.delete(entity);
    self.db.commit()
