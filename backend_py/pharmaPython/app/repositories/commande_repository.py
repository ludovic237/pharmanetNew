from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional, List, Tuple

from app.models.commandeout import Commande
from app.models.user import User


class CommandeRepository:
  def __init__(self, db: Session): self.db = db

  def find_all(self) -> List[Commande]: return self.db.query(Commande).filter(Commande.supprimer == 0).all()

  def find_paged(self, q, page: int, size: int) -> Tuple[List[Commande], int]:
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_by_id(self, id_: int) -> Optional[Commande]: return self.db.query(Commande).filter(
    Commande.id == id_).first()

  def count_mois(self) -> int:
    now = datetime.utcnow()
    return self.db.query(func.count(Commande.id)).filter(
      func.extract('year', Commande.date_creation) == now.year,
      func.extract('month', Commande.date_creation) == now.month
    ).scalar() or 0

  def save(self, c: Commande) -> Commande:
    self.db.add(c);
    self.db.commit();
    self.db.refresh(c);
    return c
