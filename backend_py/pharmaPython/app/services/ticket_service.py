# services/ticket_service.py
from sqlalchemy.orm import Session
from datetime import datetime, date

from app.repositories.ticket_caisse_repository import TicketCaisseRepository


class TicketService:
  def __init__(self, db: Session):
    self.db = db
    self.ticket_repo = TicketCaisseRepository(db)

  def get_all_tickets(self):
    return self.ticket_repo.find_all()

  def get_ticket_by_id(self, id_: int):
    t = self.ticket_repo.find_by_id(id_)
    if not t:
      raise ValueError(f"Ticket with ID {id_} not found")
    return t

  def get_ticket_by_codebarre(self, codebarre: int):
    return self.ticket_repo.find_by_codebarre(codebarre)

  def create_ticket(self, ticket):
    date_code = datetime.now().strftime("%y%m%d%H%M%S")
    ticket.codebarre = int(date_code)
    ticket.dateGenere = date.today()
    ticket.supprimer = 0
    return self.ticket_repo.save(ticket)

  def update_ticket(self, id_: int, updated_ticket):
    existing = self.ticket_repo.find_by_id(id_)
    if not existing:
      raise ValueError(f"Ticket with ID {id_} not found")
    existing.codebarre = updated_ticket.codebarre
    existing.montant = updated_ticket.montant
    existing.statut = updated_ticket.statut
    existing.validite = updated_ticket.validite
    return self.ticket_repo.save(existing)

  def delete_ticket(self, id_: int):
    t = self.ticket_repo.find_by_id(id_)
    if not t:
      raise ValueError(f"Ticket with ID {id_} not found")
    t.supprimer = 1
    return self.ticket_repo.save(t)
