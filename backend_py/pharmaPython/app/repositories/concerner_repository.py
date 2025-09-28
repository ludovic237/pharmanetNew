# repositories/concerner_repository.py
from __future__ import annotations
from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.models.concerner import Concerner
from app.models.en_rayon import EnRayon
from app.models.produit import Produit
from app.models.produit_detail import ProduitDetail
from app.models.vente import Vente


class ConcernerRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_id(self, id_: int) -> Optional[Concerner]:
    return self.db.query(Concerner).get(id_)

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
            SELECT p.nom AS nom, p.id AS id,
            COALESCE(SUM(con.quantite),0) AS qty,
            COALESCE(SUM(con.prix_unit * con.quantite),0) AS total
            FROM concerner con
            JOIN en_rayon r ON r.id = con.en_rayon_id
            JOIN produit  p ON p.id = r.produit_id
            JOIN vente    v ON v.id = con.vente_id
            WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
            GROUP BY p.nom, p.id
            ORDER BY qty DESC
            LIMIT :limit
        """)
    rows = self.db.execute(sql, {"limit": limit, "from": start, "to": end}).mappings().all()
    return [{"nom": r["nom"], "id": r["id"], "qty": int(r["qty"]), "total": float(r["total"])} for r in rows]

  def total_qty_by_product_between(self, produit_id: int, start: datetime, end: datetime) -> int:
    """
    Somme des quantités pour un produit donné entre deux dates.
    Utilise la même logique de jointure que top_products().
    """
    sql = text("""
              SELECT COALESCE(SUM(con.quantite),0) AS qty,
            p.id AS id
            FROM concerner con
            JOIN en_rayon r ON r.id = con.en_rayon_id
            JOIN produit  p ON p.id = r.produit_id
            JOIN vente    v ON v.id = con.vente_id
            WHERE v.supprimer=0
              AND p.id = :pid
              AND v.date_vente BETWEEN :from AND :to
        """)
    row = self.db.execute(sql, {"pid": produit_id, "from": start, "to": end}).mappings().first()
    return  int(row["qty"] or 0)

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

  def save(self, concerner: Concerner) -> Concerner:
    self.db.add(concerner)
    self.db.commit()
    self.db.refresh(concerner)
    return concerner

  def fetch_last_baskets(self, limit: int = 5000) -> List[List[int]]:
    """
    Retourne une liste de paniers (baskets) récents:
    [[prod_id, prod_id, ...], ...] groupé par vente_id (ordre ventes récentes).

    Récupère produit_id via COALESCE(EnRayon.produit_id, ProduitDetail.produit_id).
    """
    # 1) Récupérer les derniers ventes.ids (ordre le + récent)
    last_vente_ids = [
      v.id for v in (
        self.db.query(Vente.id)
        .order_by(Vente.date_vente.desc(), Vente.id.desc())
        .limit(limit)  # limite sur le nombre de ventes choisies
        .all()
      )
    ]
    if not last_vente_ids:
      return []

    # 2) Récupérer les lignes Concerner correspondantes et en déduire produit_id
    # prod_id_expr = func.coalesce(EnRayon.produit_id, ProduitDetail.id)
    prod_id_expr = func.coalesce(EnRayon.produit_id, Produit.id)

    rows = (
      self.db.query(
        Concerner.vente_id.label("vente_id"),
        prod_id_expr.label("produit_id")
      )
      .filter(Concerner.vente_id.in_(last_vente_ids))
      .outerjoin(EnRayon, EnRayon.id == Concerner.en_rayon_id)
      .outerjoin(Produit, Produit.id == EnRayon.produit_id)
      # .outerjoin(ProduitDetail, ProduitDetail.id == Concerner.en_rayon_id)
      .all()
    )

    # 3) Regrouper par vente_id => paniers
    baskets_map: Dict[int, List[int]] = {}
    for vente_id, produit_id in rows:
      if produit_id is None:
        continue
      baskets_map.setdefault(vente_id, []).append(int(produit_id))

    # Conserver l’ordre des ventes récentes
    baskets = [baskets_map[v_id] for v_id in last_vente_ids if v_id in baskets_map]
    return baskets

    # (exemple utile pour la série journalière si tu en as besoin)

  def fetch_last_baskets_range(self, limit: int, start: datetime, end: datetime, supprimer: int) -> List[List[int]]:
    if limit==0:
      last_vente_ids = [
        v.id for v in (
          self.db.query(Vente.id)
          .filter(Vente.supprimer == supprimer, Vente.date_vente.between(start, end))
          .order_by(Vente.date_vente.desc(), Vente.id.desc())
          .all()
        )
      ]
    else:
      last_vente_ids = [
        v.id for v in (
          self.db.query(Vente.id)
          .filter(Vente.supprimer == supprimer, Vente.date_vente.between(start, end))
          .order_by(Vente.date_vente.desc(), Vente.id.desc())
          .limit(limit)  # limite sur le nombre de ventes choisies
          .all()
        )
      ]
    if not last_vente_ids:
      return []

    # 2) Récupérer les lignes Concerner correspondantes et en déduire produit_id
    # prod_id_expr = func.coalesce(EnRayon.produit_id, ProduitDetail.id)
    prod_id_expr = func.coalesce(EnRayon.produit_id, Produit.id)

    rows = (
      self.db.query(
        Concerner.vente_id.label("vente_id"),
        prod_id_expr.label("produit_id")
      )
      .filter(Concerner.vente_id.in_(last_vente_ids))
      .outerjoin(EnRayon, EnRayon.id == Concerner.en_rayon_id)
      .outerjoin(Produit, Produit.id == EnRayon.produit_id)
      # .outerjoin(ProduitDetail, ProduitDetail.id == Concerner.en_rayon_id)
      .all()
    )

    # 3) Regrouper par vente_id => paniers
    baskets_map: Dict[int, List[int]] = {}
    for vente_id, produit_id in rows:
      if produit_id is None:
        continue
      baskets_map.setdefault(vente_id, []).append(int(produit_id))

    # Conserver l’ordre des ventes récentes
    baskets = [baskets_map[v_id] for v_id in last_vente_ids if v_id in baskets_map]
    return baskets

    # (exemple utile pour la série journalière si tu en as besoin)

  def sum_daily_qty_by_product(self, produit_id: int, from_date) -> List[Dict]:
    """
    Exemple d’agrégation par jour (utile pour la prévision).
    Suppose que Vente.date_vente est un Date/DateTime.
    """
    # NB: MySQL: utiliser DATE(Vente.date_vente) pour grouper par jour
    # print("from_date")
    # print(from_date)
    q = (
      self.db.query(
        func.date(Vente.date_vente).label("date"),
        func.sum(Concerner.quantite).label("qty"),
      )
      .join(Vente, Vente.id == Concerner.vente_id)
      .outerjoin(EnRayon, EnRayon.id == Concerner.en_rayon_id)
      # .outerjoin(ProduitDetail, ProduitDetail.id == Concerner.en_rayon_id)
      .outerjoin(Produit, Produit.id == EnRayon.produit_id)
      .filter(func.coalesce(EnRayon.produit_id, Produit.id) == produit_id)
      .filter(Vente.date_vente >= from_date)
      .group_by(func.date(Vente.date_vente))
      .order_by(func.date(Vente.date_vente))
    )
    rows = q.all()
    # print("rows 2")
    # print(rows)
    return [{"date": r.date, "qty": float(r.qty or 0)} for r in rows]

  def sum_daily_qty(self, from_date) -> List[Dict]:
    """
    Exemple d’agrégation par jour (utile pour la prévision).
    Suppose que Vente.date_vente est un Date/DateTime.
    """
    # NB: MySQL: utiliser DATE(Vente.date_vente) pour grouper par jour
    # print("from_date")
    # print(from_date)
    q = (
      self.db.query(
        func.date(Vente.date_vente).label("date"),
        func.sum(Concerner.quantite).label("qty"),
      )
      .join(Vente, Vente.id == Concerner.vente_id)
      .outerjoin(EnRayon, EnRayon.id == Concerner.en_rayon_id)
      # .outerjoin(ProduitDetail, ProduitDetail.id == Concerner.en_rayon_id)
      .outerjoin(Produit, Produit.id == EnRayon.produit_id)
      .filter(Vente.date_vente >= from_date)
      .group_by(func.date(Vente.date_vente))
      .order_by(func.date(Vente.date_vente))
    )
    rows = q.all()
    # print("rows 2")
    # print(rows)
    return [{"date": r.date, "qty": float(r.qty or 0)} for r in rows]
