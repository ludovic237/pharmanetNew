# repositories/en_rayon_repository.py
from __future__ import annotations

from typing import List, Optional, Tuple, Dict, Union
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, select, union_all, text
from app.models.en_rayon import EnRayon
from app.models.produit_detail import ProduitDetail


class EnRayonRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_id(self, id_: int) -> Optional[EnRayon]:
    return self.db.query(EnRayon).get(id_)

  def find_by_produit_id_and_commande_and_supprimer(
    self, produit_id: int, commande_id: Optional[int], supprimer: int = 0
  ) -> Optional[EnRayon]:
    q = self.db.query(EnRayon).filter(EnRayon.produit_id == produit_id, EnRayon.supprimer == supprimer)
    if commande_id is None:
      q = q.filter(EnRayon.commande_id.is_(None))
    else:
      q = q.filter(EnRayon.commande_id == commande_id)
    return q.first()

  def find_by_produit_id_and_supprimer(self, produit_id: int, supprimer: int = 0) -> List[EnRayon]:
    return self.db.query(EnRayon).filter(EnRayon.produit_id == produit_id, EnRayon.supprimer == supprimer).all()

  def find_by_produit_id_and_quantite_restante_gt_and_supprimer(
    self, produit_id: int, quantite: int = 0, supprimer: int = 0
  ) -> List[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.produit_id == produit_id, EnRayon.quantite_restante > quantite, EnRayon.supprimer == supprimer)
      .all()
    )

  def find_by_produit_id_and_id_and_supprimer(self, produit_id: int, rayon_id: str, supprimer: int = 0) -> Optional[
    EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.produit_id == produit_id, EnRayon.id == rayon_id, EnRayon.supprimer == supprimer)
      .first()
    )

  def find_top_by_produit_id_order_by_id_desc(self, produit_id: int) -> Optional[EnRayon]:
    return self.db.query(EnRayon).filter(EnRayon.produit_id == produit_id).order_by(EnRayon.id.desc()).first()

  def find_top_by_produit_id_order_by_date_livraison_desc(self, produit_id: int) -> Optional[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.produit_id == produit_id)
      .order_by(EnRayon.date_livraison.desc())
      .first()
    )

  def find_all_by_produit_id_and_supprimer(self, produit_id: int, supprimer: int = 0) -> List[EnRayon]:
    return self.db.query(EnRayon).filter(EnRayon.produit_id == produit_id, EnRayon.supprimer == supprimer).all()

  def find_all_by_produit_id_in_and_supprimer(self, produit_ids: List[int], supprimer: int = 0) -> List[EnRayon]:
    if not produit_ids:
      return []
    return self.db.query(EnRayon).filter(EnRayon.produit_id.in_(produit_ids), EnRayon.supprimer == supprimer).all()

  def find_all_by_produit_id_and_supprimer_and_quantite_restante_gt(
    self, produit_id: int, supprimer: int = 0, quantite: int = 0
  ) -> List[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.produit_id == produit_id, EnRayon.supprimer == supprimer, EnRayon.quantite_restante > quantite)
      .all()
    )

  def find_by_produit_id_in_and_supprimer(self, produit_ids: List[int], supprimer: int) -> List[EnRayon]:
    if not produit_ids:
      return []
    return self.db.query(EnRayon).filter(EnRayon.produit_id.in_(produit_ids), EnRayon.supprimer == supprimer).all()

  def find_by_fournisseur_nom_containing_ignore_case_and_supprimer(self, nom: str, supprimer: int) -> List[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(func.lower(EnRayon.fournisseur_nom).like(f"%{nom.lower()}%"), EnRayon.supprimer == supprimer)
      .all()
    )

  def find_by_commande_id_and_supprimer(self, commande_id: int, supprimer: int) -> List[EnRayon]:
    return self.db.query(EnRayon).filter(EnRayon.commande_id == commande_id, EnRayon.supprimer == supprimer).all()

  def find_by_date_livraison_between_and_supprimer(self, start: datetime, end: datetime, supprimer: int) -> List[
    EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.supprimer == supprimer, EnRayon.date_livraison.between(start, end))
      .all()
    )

  def find_by_date_peremption_between_and_supprimer(self, start: datetime, end: datetime, supprimer: int) -> List[
    EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.supprimer == supprimer, EnRayon.date_peremption.between(start, end))
      .all()
    )

  def find_by_prix_achat_between_and_supprimer(self, min_prix: float, max_prix: float, supprimer: int) -> List[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.supprimer == supprimer, EnRayon.prix_achat.between(min_prix, max_prix))
      .all()
    )

  def find_by_prix_vente_between_and_supprimer(self, min_prix: float, max_prix: float, supprimer: int) -> List[EnRayon]:
    return (
      self.db.query(EnRayon)
      .filter(EnRayon.supprimer == supprimer, EnRayon.prix_vente.between(min_prix, max_prix))
      .all()
    )

  # ---- “Specifications” traduites en filtres + pagination ----
  def filter_en_rayon(
    self,
    nom_produit: Optional[str],
    bientot_perimee: Optional[bool],
    jours_avant_peremption: Optional[int],
    en_stock: Optional[bool],
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[EnRayon], int]:
    q = self.db.query(EnRayon)
    now = datetime.now()

    if nom_produit and nom_produit != "null":
      q = q.filter(func.lower(EnRayon.produit_nom).like(f"%{nom_produit.lower()}%"))  # adapte si tu joins Produit

    if isinstance(bientot_perimee, bool):
      threshold = now + timedelta(days=7)
      if bientot_perimee:
        q = q.filter(EnRayon.date_peremption <= threshold)
      else:
        q = q.filter(EnRayon.date_peremption > threshold)

    if jours_avant_peremption and jours_avant_peremption > 0:
      target = now + timedelta(days=jours_avant_peremption)
      q = q.filter(EnRayon.date_peremption <= target)

    if isinstance(en_stock, bool):
      if en_stock:
        q = q.filter(EnRayon.quantite_restante > 0)
      else:
        q = q.filter(EnRayon.quantite_restante == 0)

    total = q.count()
    col = getattr(EnRayon, sort_by, EnRayon.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def filter_en_rayon_range(
    self,
    nom_produit: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    bientot_perimee: Optional[bool],
    jours_avant_peremption: Optional[int],
    en_stock: Optional[bool],
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[EnRayon], int]:
    q = self.db.query(EnRayon)
    now = datetime.now()

    if nom_produit and nom_produit != "null":
      q = q.filter(func.lower(EnRayon.produit_nom).like(f"%{nom_produit.lower()}%"))

    if isinstance(bientot_perimee, bool):
      th = now + timedelta(days=7)
      q = q.filter(EnRayon.date_peremption <= th) if bientot_perimee else q.filter(EnRayon.date_peremption > th)

    if jours_avant_peremption and jours_avant_peremption != "null" and int(jours_avant_peremption) > 0:
      target = now + timedelta(days=int(jours_avant_peremption))
      q = q.filter(EnRayon.date_peremption <= target)

    if isinstance(en_stock, bool):
      q = q.filter(EnRayon.quantite_restante > 0) if en_stock else q.filter(EnRayon.quantite_restante == 0)

    if start_date and start_date.strip().lower() != "null":
      q = q.filter(EnRayon.date_livraison >= datetime.fromisoformat(start_date.strip()))
    if end_date and end_date.strip().lower() != "null":
      q = q.filter(EnRayon.date_livraison <= datetime.fromisoformat(end_date.strip()))

    total = q.count()
    col = getattr(EnRayon, sort_by, EnRayon.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  def filter_en_rayon_range_with_produit_id(
    self,
    produit_id: Optional[str],
    supprimer: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    bientot_perimee: Optional[bool],
    jours_avant_peremption: Optional[int],
    en_stock: Optional[bool],
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[EnRayon], int]:
    q = self.db.query(EnRayon)
    now = datetime.now()

    if produit_id and produit_id != "null":
      q = q.filter(EnRayon.produit_id == int(produit_id))
    if supprimer and supprimer != "null":
      q = q.filter(EnRayon.supprimer == int(supprimer))

    if isinstance(bientot_perimee, bool):
      th = now + timedelta(days=7)
      q = q.filter(EnRayon.date_peremption <= th) if bientot_perimee else q.filter(EnRayon.date_peremption > th)

    if jours_avant_peremption and jours_avant_peremption > 0:
      target = now + timedelta(days=jours_avant_peremption)
      q = q.filter(EnRayon.date_peremption <= target)

    if isinstance(en_stock, bool):
      q = q.filter(EnRayon.quantite_restante > 0) if en_stock else q.filter(EnRayon.quantite_restante == 0)

    if start_date and start_date.strip().lower() != "null":
      q = q.filter(EnRayon.date_livraison >= datetime.fromisoformat(start_date.strip()))
    if end_date and end_date.strip().lower() != "null":
      q = q.filter(EnRayon.date_livraison <= datetime.fromisoformat(end_date.strip()))

    total = q.count()
    col = getattr(EnRayon, sort_by, EnRayon.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # --- Alertes stock & péremption (SQL natif similaire à Kotlin) ---
  def stock_alerts(self, low: int, days: int, limit: int) -> List[dict]:
    sql = text("""
            SELECT p.nom AS produit, p.id AS produitId, er.quantite_restante AS quantiteRestante, er.date_peremption AS datePeremption
            FROM en_rayon er
            JOIN produit p ON p.id = er.produit_id
            WHERE (er.quantite_restante IS NOT NULL AND er.quantite_restante <= :low)
               OR (er.date_peremption IS NOT NULL AND er.date_peremption <= DATE_ADD(CURDATE(), INTERVAL :days DAY))
            ORDER BY er.quantite_restante ASC, er.date_peremption ASC
            LIMIT :limit
        """)
    rows = self.db.execute(sql, {"low": low, "days": days, "limit": limit}).mappings().all()
    return [
      {
        "produit": r["produit"], "produitId": r["produitId"], "quantiteRestante": r["quantiteRestante"],
                                       "datePeremption": r["datePeremption"]}
            for r in rows]

  def alerts_ruptures(self, low: int) -> int:
    sql = text("""
            SELECT COUNT(*) FROM en_rayon
            WHERE (quantite_restante IS NOT NULL AND quantite_restante <= :low)
        """)
    return int(self.db.execute(sql, {"low": low}).scalar() or 0)

  def alerts_perimes(self, days: int) -> int:
    sql = text("""
            SELECT COUNT(*) FROM en_rayon
            WHERE date_peremption IS NOT NULL
              AND date_peremption <= DATE_ADD(CURDATE(), INTERVAL :days DAY)
        """)
    return int(self.db.execute(sql, {"days": days}).scalar() or 0)

  def save(self, enRayon: EnRayon) -> EnRayon:
    self.db.add(enRayon)
    self.db.commit()
    self.db.refresh(enRayon)
    return enRayon

  # def sum_stock_by_product(
  #   self,
  #   product_ids: Optional[List[int]] = None,
  # ) -> Dict[int, float]:
  #   """
  #   Agrège le stock total par produit_id en cumulant:
  #     - SUM(EnRayon.quantite_restante) groupé par EnRayon.produit_id
  #     - SUM(ProduitDetail.quantite_restante) groupé par ProduitDetail.produit_id
  #
  #   :param product_ids: (optionnel) liste de produits à filtrer
  #   :return: dict {produit_id: stock_total}
  #   """
  #
  #   # --- Sous-requête: stock côté EnRayon ---
  #   stmt_enrayon = (
  #     select(
  #       EnRayon.produit_id.label("produit_id"),
  #       func.coalesce(  # <- adapte le champ si nécessaire
  #         func.sum(EnRayon.quantite_restante), 0
  #       ).label("qty")
  #     )
  #     .group_by(EnRayon.produit_id)
  #   )
  #   print("product_ids")
  #   print(product_ids)
  #   print("stmt_enrayon")
  #   print(stmt_enrayon)
  #   if product_ids:
  #     stmt_enrayon = stmt_enrayon.where(EnRayon.produit_id.in_(product_ids))
  #
  #   # --- Sous-requête: stock côté ProduitDetail ---
  #   stmt_pdetail = (
  #     select(
  #       ProduitDetail.id.label("produit_id"),
  #       func.coalesce(  # <- adapte le champ si nécessaire
  #         func.sum(ProduitDetail.stock), 0
  #       ).label("qty")
  #     )
  #     .group_by(ProduitDetail.id)
  #   )
  #   if product_ids:
  #     stmt_pdetail = stmt_pdetail.where(ProduitDetail.id.in_(product_ids))
  #
  #   # --- UNION ALL pour cumuler les deux sources ---
  #   union_stmt = union_all(stmt_enrayon, stmt_pdetail).subquery()
  #
  #   # --- Re-agrégation finale par produit_id ---
  #   final_stmt = (
  #     select(
  #       union_stmt.c.produit_id,
  #       func.sum(union_stmt.c.qty).label("stock_total")
  #     )
  #     .group_by(union_stmt.c.produit_id)
  #   )
  #
  #   rows: List[Tuple[int, float]] = self.db.execute(final_stmt).all()
  #
  #   # Transformer en dict {produit_id: stock_total}
  #   return {int(pid): float(stock or 0) for pid, stock in rows}

  # def sum_stock_by_product(
  #   self,
  #   product_ids: Optional[Union[int, List[int]]] = None,
  # ) -> Dict[int, float]:
  #   """
  #   Agrège le stock total par produit_id en cumulant:
  #     - SUM(EnRayon.quantite_restante) groupé par EnRayon.produit_id
  #     - SUM(ProduitDetail.stock) groupé par ProduitDetail.id  (à adapter si ton modèle a produit_id)
  #   Accepte product_ids = None | int | List[int]
  #   """
  #
  #   # --- Normalisation: int -> [int]
  #   ids_list: Optional[List[int]]
  #   if product_ids is None:
  #     ids_list = None
  #   elif isinstance(product_ids, int):
  #     ids_list = [product_ids]
  #   else:
  #     ids_list = list(product_ids)  # au cas où ce soit un tuple / set
  #
  #   # --- Sous-requête: stock côté EnRayon ---
  #   stmt_enrayon = (
  #     select(
  #       EnRayon.produit_id.label("produit_id"),
  #       func.coalesce(func.sum(EnRayon.quantite_restante), 0).label("qty"),
  #     )
  #     .group_by(EnRayon.produit_id)
  #   )
  #   if ids_list:
  #     stmt_enrayon = stmt_enrayon.where(EnRayon.produit_id.in_(ids_list))
  #
  #   # --- Sous-requête: stock côté ProduitDetail ---
  #   # NOTE: si ton modèle a ProduitDetail.produit_id, remplace id -> produit_id ci-dessous.
  #   stmt_pdetail = (
  #     select(
  #       ProduitDetail.id.label("produit_id"),
  #       func.coalesce(func.sum(ProduitDetail.stock), 0).label("qty"),
  #     )
  #     .group_by(ProduitDetail.id)
  #   )
  #   if ids_list:
  #     stmt_pdetail = stmt_pdetail.where(ProduitDetail.id.in_(ids_list))
  #
  #   # --- UNION ALL puis agrégation finale ---
  #   union_stmt = union_all(stmt_enrayon, stmt_pdetail).subquery()
  #   final_stmt = (
  #     select(
  #       union_stmt.c.produit_id,
  #       func.sum(union_stmt.c.qty).label("stock_total"),
  #     )
  #     .group_by(union_stmt.c.produit_id)
  #   )
  #
  #   rows: List[Tuple[int, float]] = self.db.execute(final_stmt).all()
  #   return {int(pid): float(stock or 0) for pid, stock in rows}

  def sum_stock_by_product(self, produit_id: int) -> float:
    total = (
      self.db.query(func.coalesce(func.sum(EnRayon.quantite_restante), 0.0))
      .filter(EnRayon.produit_id == produit_id)
      .scalar()
    )
    return float(total or 0.0)
