# repositories/caisse_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.caisse import Caisse
from app.models.employe import Employe

class CaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_id(self, id_: int) -> Optional[Caisse]:
    return self.db.query(Caisse).get(id_)

  def find_top_by_order_by_id_desc(self) -> Optional[Caisse]:
    return self.db.query(Caisse).order_by(Caisse.id.desc()).first()

  def find_by_etat_and_supprimer(self, etat: str, supprimer: int = 0) -> List[Caisse]:
    return self.db.query(Caisse).filter(Caisse.etat == etat, Caisse.supprimer == supprimer).all()

  def find_by_etat_and_supprimer_first(self, etat: str, supprimer: int = 0) -> Caisse:
    return self.db.query(Caisse).filter(Caisse.etat == etat, Caisse.supprimer == supprimer).first()

  def exists_by_etat_and_supprimer(self, etat: str, supprimer: int = 0) -> bool:
    return (
      self.db.query(Caisse.id)
      .filter(Caisse.etat == etat, Caisse.supprimer == supprimer)
      .first()
      is not None
    )

  def find_by_user_and_etat_and_supprimer(self, employe: Employe, etat: str, supprimer: int = 0) -> List[Caisse]:
    return (
      self.db.query(Caisse)
      .filter(Caisse.user_id == employe.id, Caisse.etat == etat, Caisse.supprimer == supprimer)
      .all()
    )

  def find_by_user_and_etat(self, employe: Employe, etat: str) -> Optional[Caisse]:
    return self.db.query(Caisse).filter(Caisse.user_id == employe.id, Caisse.etat == etat).first()

  def find_by_user_and_supprimer_order_by_date_ouvert_desc(self, employe: Employe, supprimer: int = 0) -> List[Caisse]:
    return (
      self.db.query(Caisse)
      .filter(Caisse.user_id == employe.id, Caisse.supprimer == supprimer)
      .order_by(Caisse.date_ouvert.desc())
      .all()
    )

  # ---- filterByCriteria(caisseId, startDate, endDate) ----
  def filter_by_criteria(
    self, caisse_id: Optional[int], start_date: Optional[date], end_date: Optional[date],
    page: int = 0, size: int = 10
  ) -> Tuple[List[Caisse], int]:
    q = self.db.query(Caisse)
    if caisse_id is not None:
      q = q.filter(Caisse.id == caisse_id)
    if start_date is not None:
      q = q.filter(Caisse.date_ouvert >= start_date)
    if end_date is not None:
      q = q.filter(Caisse.date_ferme <= end_date)
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  # ---- KPIs (requêtes natives Kotlin) ----
  def sessions_ouvertes(self) -> int:
    return int(self.db.query(func.count(Caisse.id)).filter(Caisse.supprimer == 0, Caisse.etat == "OUVERT").scalar() or 0)

  def sessions_cloturees(self) -> int:
    return int(self.db.query(func.count(Caisse.id)).filter(Caisse.supprimer == 0, Caisse.etat == "FERME").scalar() or 0)

  # Sauvegarde / update d'une caisse
  def save(self, caisse: Caisse) -> Caisse:
    self.db.add(caisse)
    self.db.commit()
    self.db.refresh(caisse)
    return caisse
