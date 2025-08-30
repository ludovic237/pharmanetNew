# repositories/concerner_repository.py
from __future__ import annotations
from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.concerner import Concerner

class ConcernerRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_vente_id_and_produit_id(self, vente_id: int, produit_id: int) -> Optional[Concerner]:
    return (
      self.db.query(Concerner)
      .filter(Concerner.vente_id == vente_id, Concerner.produit_id == produit_id)
      .first()
    )

  def find_by_vente_id_and_en_rayon_id(self, vente_id: int, en_rayon_id: str) -> Optional[Concerner]:
    return (
      self.db.query(Concerner)
      .filter(Concerner.vente_id == vente_id, Concerner.en_rayon_id == en_rayon_id)
      .first()
    )

  def find_by_vente_id_and_en_rayon_id_in(self, vente_id: int, en_rayon_ids: List[str]) -> List[Concerner]:
    if not en_rayon_ids:
      return []
    return (
      self.db.query(Concerner)
      .filter(Concerner.vente_id == vente_id, Concerner.en_rayon_id.in_(en_rayon_ids))
      .all()
    )

  def find_by_vente_id(self, vente_id: int) -> List[Concerner]:
    return self.db.query(Concerner).filter(Concerner.vente_id == vente_id).all()

  def find_by_produit_id(self, produit_id: int) -> List[Concerner]:
    return self.db.query(Concerner).filter(Concerner.produit_id == produit_id).all()

  # --- requêtes natives topProducts & salesByCategory ---
  def top_products(self, limit: int, start: datetime, end: datetime) -> List[Dict]:
    sql = text("""
            SELECT p.nom AS nom, COALESCE(SUM(con.quantite),0) AS qty
            FROM concerner con
            JOIN en_rayon r ON r.id = con.en_rayon_id
            JOIN produit  p ON p.id = r.produit_id
            JOIN vente    v ON v.id = con.vente_id
            WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
            GROUP BY p.nom
            ORDER BY qty DESC
            LIMIT :limit
        """)
    rows = self.db.execute(sql, {"limit": limit, "from": start, "to": end}).mappings().all()
    return [{"nom": r["nom"], "qty": int(r["qty"])} for r in rows]

  def sales_by_category(self, start: datetime, end: datetime) -> List[Dict]:
    sql = text("""
            SELECT c.nom AS categorie, COALESCE(SUM(con.prix_unit * con.quantite),0) AS total
            FROM concerner con
            JOIN vente v   ON v.id = con.vente_id
            JOIN en_rayon r ON r.id = con.en_rayon_id
            JOIN produit p ON p.id = r.produit_id
            JOIN categorie c ON c.id = p.categorie_id
            WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
            GROUP BY c.nom
            ORDER BY total DESC
        """)
    rows = self.db.execute(sql, {"from": start, "to": end}).mappings().all()
    return [{"categorie": r["categorie"], "total": float(r["total"])} for r in rows]
