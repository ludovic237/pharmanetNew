# repositories/ticket_caisse_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.ticket_caisse import TicketCaisse  # adapte le chemin

class TicketCaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_codebarre(self, codebarre: int) -> Optional[TicketCaisse]:
    return (
      self.db.query(TicketCaisse)
      .filter(TicketCaisse.codebarre == codebarre)
      .first()
    )

  # helpers CRUD
  def save(self, entity: TicketCaisse) -> TicketCaisse:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[TicketCaisse]:
    return self.db.query(TicketCaisse).get(id_)
  def delete(self, entity: TicketCaisse) -> None:
    self.db.delete(entity); self.db.commit()
