# repositories/commande_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, text

from app.models.commandeout import Commande


class CommandeRepository:
  def __init__(self, db: Session):
    self.db = db

  # COUNT mois courant
  def count_mois(self) -> int:
    today = datetime.today()
    return int(
      self.db.query(func.count(Commande.id))
      .filter(
        Commande.supprimer == 0,
        func.extract("year", Commande.dateCreation) == today.year,
        func.extract("month", Commande.dateCreation) == today.month,
        )
      .scalar() or 0
    )

  # filterCommandes(etat, typeFournisseur, fournisseurId, startDate, endDate)
  def filter_commandes(
    self,
    etat: Optional[str],
    type_fournisseur: Optional[str],
    fournisseur_id: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    page: int = 0,
    size: int = 10,
    sort_by: str = "dateCreation",
    direction: str = "DESC",
  ) -> Tuple[List[Commande], int]:
    q = self.db.query(Commande)

    if etat and etat != "null":
      q = q.filter(func.upper(Commande.etat) == etat.upper())

    if fournisseur_id and fournisseur_id != "null":
      q = q.filter(Commande.fournisseur_id == int(fournisseur_id))

    if type_fournisseur and type_fournisseur != "null":
      q = q.filter(Commande.fournisseur_statut == type_fournisseur)  # adapte si le champ est ailleurs

    if start_date and start_date.strip().lower() != "null":
      q = q.filter(Commande.dateCreation >= datetime.fromisoformat(start_date.strip()))
    if end_date and end_date.strip().lower() != "null":
      q = q.filter(Commande.dateCreation <= datetime.fromisoformat(end_date.strip()))

    total = q.count()
    col = getattr(Commande, sort_by, Commande.dateCreation)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # ordersRecent(limit, offset) (SQL natif avec projection)
  def orders_recent(self, limit: int, offset: int) -> List[Dict]:
    sql = text("""
            SELECT cmd.id                AS id,
                   cmd.ref               AS ref,
                   four.nom              AS fournisseur,
                   cmd.montant_cmd       AS montantCmd,
                   cmd.montant_recu      AS montantRecu,
                   cmd.etat              AS etat,
                   cmd.date_creation     AS dateCreation,
                   cmd.date_livraison    AS dateLivraison
            FROM commande cmd
            LEFT JOIN fournisseur four ON four.id = cmd.fournisseur_id
            WHERE cmd.supprimer=0
            ORDER BY cmd.date_creation DESC
            LIMIT :limit OFFSET :offset
        """)
    rows = self.db.execute(sql, {"limit": limit, "offset": offset}).mappings().all()
    return [dict(r) for r in rows]
