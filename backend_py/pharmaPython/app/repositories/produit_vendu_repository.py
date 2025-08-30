# repositories/produit_vendu_repository.py
from __future__ import annotations
from typing import List, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

class ProduitVenduRepository:
  def __init__(self, db: Session):
    self.db = db

  def top_products(self, limit: int, start: datetime, end: datetime) -> List[Dict]:
    sql = text("""
            SELECT p.nom AS nom, COALESCE(SUM(pv.qtite_vendu),0) AS qty
            FROM produit_vendu pv
            JOIN produit p ON p.id = pv.produit_id
            JOIN vente v   ON v.id = pv.vente_id
            WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
            GROUP BY p.nom
            ORDER BY qty DESC
            LIMIT :limit
        """)
    rows = self.db.execute(sql, {"limit": limit, "from": start, "to": end}).mappings().all()
    return [{"nom": r["nom"], "qty": int(r["qty"])} for r in rows]

  def sales_by_category(self, start: datetime, end: datetime) -> List[Dict]:
    sql = text("""
            SELECT c.nom AS categorie, COALESCE(SUM(pv.qtite_vendu * pv.prix_unit),0) AS total
            FROM produit_vendu pv
            JOIN produit p   ON p.id = pv.produit_id
            JOIN categorie c ON c.id = p.categorie_id
            JOIN vente v     ON v.id = pv.vente_id
            WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
            GROUP BY c.nom
            ORDER BY total DESC
        """)
    rows = self.db.execute(sql, {"from": start, "to": end}).mappings().all()
    return [{"categorie": r["categorie"], "total": float(r["total"])} for r in rows]
