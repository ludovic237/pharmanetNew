# repositories/vente_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple, Dict, Any, Iterable
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, extract

# ⚠️ Adapte ces imports à ton projet
from app.models.vente import Vente
from app.models.caisse import Caisse
from app.models.user import User
from app.models.employe import Employe
from app.models.prescripteur import Prescripteur
from sqlalchemy.sql.elements import BinaryExpression


class VenteRepository:
  def __init__(self, db: Session):
    self.db = db

  def save(self, entity: Vente) -> Vente:
    self.db.add(entity);
    self.db.commit();
    self.db.refresh(entity);
    return entity

  def find_by_id(self, id_: int) -> Optional[Vente]:
    return self.db.query(Vente).get(id_)

  # --- méthodes "simples" ---
  def find_by_caisse_id(self, caisse_id: int) -> List[Vente]:
    return self.db.query(Vente).filter(Vente.caisse_id == caisse_id).all()

  def find_by_caisse_id_and_prix_percu_gte(self, caisse_id: int, prix_percu: Optional[float]) -> List[Vente]:
    q = self.db.query(Vente).filter(Vente.caisse_id == caisse_id)
    if prix_percu is not None:
      q = q.filter(Vente.prix_percu >= prix_percu)
    return q.all()

  def find_by_caisse_id_and_prix_percu_gt(self, caisse_id: int, prix_percu: Optional[float]) -> List[Vente]:
    q = self.db.query(Vente).filter(Vente.caisse_id == caisse_id)
    if prix_percu is not None:
      q = q.filter(Vente.prix_percu > prix_percu)
    return q.all()

  def find_by_id_and_supprimer(self, id_: int, supprimer: int) -> Optional[Vente]:
    return (
      self.db.query(Vente)
      .filter(Vente.id == id_, Vente.supprimer == supprimer)
      .first()
    )

  def find_by_date_vente_between_and_supprimer(
    self, start: datetime, end: datetime, supprimer: int = 0
  ) -> List[Vente]:
    return (
      self.db.query(Vente)
      .filter(
        Vente.supprimer == supprimer,
        Vente.date_vente.between(start, end),
      )
      .all()
    )

  def find_by_id_and_etat(self, id_: int, etat: str) -> Optional[Vente]:
    return (
      self.db.query(Vente)
      .filter(Vente.id == id_, Vente.etat == etat)
      .first()
    )

  def find_ventes_with_prix_percu_zero(self) -> List[Vente]:
    return (
      self.db.query(Vente)
      .filter(
        Vente.supprimer == 0,
        or_(Vente.prix_percu == 0, Vente.prix_percu.is_(None)),
      )
      .all()
    )

  def find_ventes_with_prix_percu(self) -> List[Vente]:
    return (
      self.db.query(Vente)
      .filter(Vente.supprimer == 0, Vente.prix_percu > 0)
      .all()
    )

  def find_by_prix_percu_greater_than(self, prix: float) -> List[Vente]:
    return self.db.query(Vente).filter(Vente.prix_percu > prix).all()

  def find_by_prix_percu_equals(self, prix: float) -> List[Vente]:
    return self.db.query(Vente).filter(Vente.prix_percu == prix).all()

  def count_mois(self) -> int:
    """Equivalent du COUNT des ventes du mois courant (date_vente dans le mois & année courants)."""
    today = date.today()
    return (
      self.db.query(func.count(Vente.id))
      .filter(
        Vente.supprimer == 0,
        extract("year", Vente.date_vente) == today.year,
        extract("month", Vente.date_vente) == today.month,
      )
      .scalar()
      or 0
    )

  # --- Specifications: filterVentes(...) ---
  def filter_ventes(
    self,
    *,
    active_caisse: Optional[Caisse],
    supprimer: Optional[int],
    prix_percu: Optional[int],
    etat: Optional[str],
    date_vente: Optional[str],  # non utilisé dans le Kotlin final
    date_encaissement: Optional[str],  # non utilisé dans le Kotlin final
    user_id: Optional[str],
    employe_id: Optional[str],
    prescripteur_id: Optional[str],
    caisse_id: Optional[str],  # non utilisé dans le Kotlin final
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[Vente], int]:
    q = self.db.query(Vente)

    # etat
    if etat and etat != "null":
      q = q.filter(Vente.etat == etat)

    # activeCaisse (même logique que Kotlin)
    if active_caisse is not None:
      q = q.filter(Vente.caisse_id == active_caisse.id)
    else:
      q = q.filter(Vente.caisse_id.is_(None))

    if supprimer is not None:
      q = q.filter(Vente.supprimer == supprimer)

    if prix_percu is not None:
      if prix_percu == 0:
        q = q.filter(Vente.prix_percu == 0)
      elif prix_percu > 0:
        # Kotlin: greaterThanOrEqualTo(..., 0) (semble vouloir ">= 0")
        q = q.filter(Vente.prix_percu >= 0)

    if user_id and user_id != "null":
      q = q.filter(Vente.user_id == int(user_id))
    if employe_id and employe_id != "null":
      q = q.filter(Vente.employe_id == int(employe_id))
    if prescripteur_id and prescripteur_id != "null":
      q = q.filter(Vente.prescripteur_id == int(prescripteur_id))

    total = q.count()

    # tri
    col = getattr(Vente, sort_by, Vente.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()

    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # --- Specifications: filterVentesRange(...) ---
  def filter_ventes_range(
    self,
    *,
    active_caisse: Optional[Caisse],
    supprimer: Optional[int],
    prix_percu: Optional[int],
    etat: Optional[str],
    start_date_vente: Optional[str],
    end_date_vente: Optional[str],
    start_date_encaissement: Optional[str],  # non utilisé côté Kotlin final
    end_date_encaissement: Optional[str],  # non utilisé côté Kotlin final
    user_id: Optional[str],
    employe_id: Optional[str],
    prescripteur_id: Optional[str],
    caisse_id: Optional[str],  # non utilisé
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[Vente], int]:
    q = self.db.query(Vente)

    # plage de dates sur date_vente (Kotlin parse LocalDateTime des strings données)
    if start_date_vente and end_date_vente:
      start_dt = datetime.fromisoformat(start_date_vente.strip())
      end_dt = datetime.fromisoformat(end_date_vente.strip())
      q = q.filter(Vente.date_vente.between(start_dt, end_dt))

    if etat and etat != "null":
      q = q.filter(Vente.etat == etat)

    if active_caisse is not None:
      q = q.filter(Vente.caisse_id == active_caisse.id)

    if supprimer is not None:
      q = q.filter(Vente.supprimer == supprimer)

    if prix_percu is not None:
      if prix_percu == 0:
        q = q.filter(Vente.prix_percu == 0)
      elif prix_percu > 0:
        q = q.filter(Vente.prix_percu >= 0)

    if user_id and user_id != "null":
      q = q.filter(Vente.user_id == int(user_id))
    if employe_id and employe_id != "null":
      q = q.filter(Vente.employe_id == int(employe_id))
    if prescripteur_id and prescripteur_id != "null":
      q = q.filter(Vente.prescripteur_id == int(prescripteur_id))

    total = q.count()

    col = getattr(Vente, sort_by, Vente.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # --- autres méthodes ---
  def find_by_reference_and_supprimer(self, reference: str, supprimer: int) -> Optional[Vente]:
    return (
      self.db.query(Vente)
      .filter(Vente.reference == reference, Vente.supprimer == supprimer)
      .first()
    )

  # === KPIs ===
  def kpi_ca(self, start: datetime, end: datetime) -> float:
    """SUM(prix_total) where supprimer=0 and date_vente in [start, end]."""
    return (
      self.db.query(func.coalesce(func.sum(Vente.prix_total), 0.0))
      .filter(Vente.supprimer == 0, Vente.date_vente.between(start, end))
      .scalar()
      or 0.0
    )

  def kpi_encaisse(self, start: datetime, end: datetime) -> float:
    """SUM(prix_percu) where supprimer=0 and date_encaissement in [start, end]."""
    return (
      self.db.query(func.coalesce(func.sum(Vente.prix_percu), 0.0))
      .filter(Vente.supprimer == 0, Vente.date_encaissement.between(start, end))
      .scalar()
      or 0.0
    )

  def kpi_tickets(self, start: datetime, end: datetime) -> int:
    """COUNT(*) where supprimer=0 and date_vente in [start, end]."""
    return (
      self.db.query(func.count(Vente.id))
      .filter(Vente.supprimer == 0, Vente.date_vente.between(start, end))
      .scalar()
      or 0
    )

  # === Graph mensuel ===
  def sales_monthly(self, start: datetime, end: datetime) -> list[dict]:
    rows = (
      self.db.query(
        extract("year", Vente.date_vente).label("y"),
        extract("month", Vente.date_vente).label("m"),
        func.coalesce(func.sum(Vente.prix_total), 0.0).label("total"),
      )
      .filter(Vente.supprimer == 0, Vente.date_vente.between(start, end))
      .group_by("y", "m")
      .order_by("y", "m")
      .all()
    )
    # rows = [(y, m, total), ...] selon le dialecte
    out = []
    for r in rows:
      # compat: selon le driver, r peut être tuple ou Row
      y = int(getattr(r, "y", r[0]))
      m = int(getattr(r, "m", r[1]))
      total = float(getattr(r, "total", r[2] if len(r) > 2 else 0.0) or 0.0)
      out.append({"mois": f"{y:04d}-{m:02d}", "total": total})
    return out



  def find_all(
    self,
    spec: Dict[str, Any] | Iterable[BinaryExpression] | None = None,
    page: int = 0,
    size: int = 10,
    sort: str = "dateVente",
    direction: str = "DESC",
  ) -> Tuple[List[Vente], int]:
    q = self.db.query(Vente)

    # Accepte dict OU liste/tuple de filtres SQLAlchemy
    if spec:
      # cas 1: dictionnaire clé/valeur
      if isinstance(spec, dict):
        for key, value in spec.items():
          if value is None or (isinstance(value, str) and value.lower() == "null"):
            continue
          column = getattr(Vente, key, None)
          if column is not None:
            q = q.filter(column == value)
      # cas 2: itérable de BinaryExpression (ex: [Vente.etat == "VALIDE", Vente.supprimer == 0])
      elif isinstance(spec, (list, tuple)):
        from sqlalchemy.sql.elements import BinaryExpression
        filters = [f for f in spec if isinstance(f, BinaryExpression)]
        if filters:
          q = q.filter(*filters)

    total = q.count()

    sort_col = getattr(Vente, sort, getattr(Vente, "date_vente", Vente.id))
    sort_col = sort_col.desc() if direction.upper() == "DESC" else sort_col.asc()
    rows = q.order_by(sort_col).offset(page * size).limit(size).all()
    return rows, total
