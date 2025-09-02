# repositories/retour_produit_repository.py
from typing import List, Optional, Type, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.retour_produit import RetourProduit
from app.models.caisse import Caisse

class RetourProduitRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> list[Type[RetourProduit]]:
    return self.db.query(RetourProduit).all()

  def find_all_pageable(
    self,
    *,  supprimer: Optional[int], page: Optional[int], size: Optional[int],
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[RetourProduit], int]:
    q = self.db.query(RetourProduit)

    q = q.filter(RetourProduit.supprimer == supprimer)

    total = q.count()
    col = getattr(RetourProduit, sort_by, RetourProduit.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def find_by_caisse(self, caisse: Caisse) -> List[RetourProduit]:
    return self.db.query(RetourProduit).filter(RetourProduit.caisse_id == caisse.id).all()

  def kpi_taux_retour(self, start: datetime, end: datetime) -> float:
    """
    SELECT
      (SELECT COUNT(*) FROM retour_produit r WHERE r.date_retour BETWEEN :from AND :to) * 1.0 /
      NULLIF((SELECT COUNT(*) FROM vente v WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to), 0)
    """
    sql = text("""
            SELECT
              (SELECT COUNT(*) FROM retour_produit r WHERE r.date_retour BETWEEN :from AND :to) * 1.0 /
              NULLIF((SELECT COUNT(*) FROM vente v WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to), 0)
        """)
    val = self.db.execute(sql, {"from": start, "to": end}).scalar()
    return float(val or 0.0)

  # helpers CRUD
  def find_by_id(self, id_: int) -> Optional[RetourProduit]:
    return self.db.query(RetourProduit).get(id_)
  def save(self, entity: RetourProduit) -> RetourProduit:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: RetourProduit) -> None:
    self.db.delete(entity); self.db.commit()
