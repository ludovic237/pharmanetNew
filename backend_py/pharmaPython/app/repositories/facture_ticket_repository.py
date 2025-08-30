# repositories/facture_ticket_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.facture_ticket import FactureTicket  # adapte

class FactureTicketRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_facturation_id(self, facturation_id: int) -> Optional[FactureTicket]:
    return (
      self.db.query(FactureTicket)
      .filter(FactureTicket.facturation_id == facturation_id)
      .first()
    )

  def exists_by_facturation_id(self, facturation_id: int) -> bool:
    return (
      self.db.query(FactureTicket.id)
      .filter(FactureTicket.facturation_id == facturation_id)
      .first()
      is not None
    )

  # helpers
  def save(self, entity: FactureTicket) -> FactureTicket:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[FactureTicket]:
    return self.db.query(FactureTicket).get(id_)
  def delete(self, entity: FactureTicket) -> None:
    self.db.delete(entity); self.db.commit()
