from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date

from app.models.caisse import Caisse
from app.models.employe import Employe


class CaisseRepository:

  def __init__(self, db: Session):
    self.db = db

  # Récupère la dernière caisse (équivalent de findTopByOrderByIdDesc)
  def find_top_by_order_by_id_desc(self) -> Optional[Caisse]:
    return self.db.query(Caisse).order_by(Caisse.id.desc()).first()

  # Récupère toutes les caisses par état et supprimer
  def find_by_etat_and_supprimer(self, etat: str, supprimer: int = 0) -> List[Caisse]:
    return self.db.query(Caisse).filter(Caisse.etat == etat, Caisse.supprimer == supprimer).all()

  # Vérifie existence d'une caisse par état et supprimer
  def exists_by_etat_and_supprimer(self, etat: str, supprimer: int = 0) -> bool:
    return self.db.query(Caisse).filter(Caisse.etat == etat, Caisse.supprimer == supprimer).count() > 0

  # Récupère les caisses d'un employé selon état et supprimer
  def find_by_user_and_etat_and_supprimer(self, employe: Employe, etat: str, supprimer: int = 0) -> List[Caisse]:
    return self.db.query(Caisse).filter(
      Caisse.user_id == employe.id,
      Caisse.etat == etat,
      Caisse.supprimer == supprimer
    ).all()

  # Récupère une caisse d'un employé selon état
  def find_by_user_and_etat(self, employe: Employe, etat: str) -> Optional[Caisse]:
    return self.db.query(Caisse).filter(
      Caisse.user_id == employe.id,
      Caisse.etat == etat
    ).first()

  # Récupère toutes les caisses d'un employé triées par date d'ouverture
  def find_by_user_and_supprimer_order_by_date_ouvert_desc(self, employe: Employe, supprimer: int = 0) -> List[Caisse]:
    return self.db.query(Caisse).filter(
      Caisse.user_id == employe.id,
      Caisse.supprimer == supprimer
    ).order_by(Caisse.date_ouvert.desc()).all()

  # Sessions ouvertes (équivalent @Query sessionsOuvertes)
  def sessions_ouvertes(self) -> int:
    return self.db.query(func.count(Caisse.id)).filter(Caisse.supprimer == 0, Caisse.etat == "OUVERT").scalar()

  # Sessions clôturées (équivalent @Query sessionsCloturees)
  def sessions_cloturees(self) -> int:
    return self.db.query(func.count(Caisse.id)).filter(Caisse.supprimer == 0, Caisse.etat == "FERME").scalar()

  # Filtrage dynamique par critères (équivalent Specification)
  def filter_by_criteria(self, caisse_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Caisse]:
    query = self.db.query(Caisse)
    if caisse_id is not None:
      query = query.filter(Caisse.id == caisse_id)
    if start_date is not None:
      query = query.filter(Caisse.date_ouvert >= start_date)
    if end_date is not None:
      query = query.filter(Caisse.date_ferme <= end_date)
    return query.all()

  # Sauvegarde / update d'une caisse
  def save(self, caisse: Caisse) -> Caisse:
    self.db.add(caisse)
    self.db.commit()
    self.db.refresh(caisse)
    return caisse
