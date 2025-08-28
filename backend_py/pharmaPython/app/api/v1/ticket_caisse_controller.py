from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db
from app.models.ticket_caisse import TicketCaisse
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/admin/tickets", tags=["Tickets"])

@router.get("/", response_model=List[TicketCaisse])
def get_all_tickets(db: Session = Depends(get_db)):
  return TicketService(db, ticket_repo=...).get_all_tickets()

@router.get("/{id}", response_model=TicketCaisse)
def get_ticket_by_id(id: int = Path(..., ge=1), db: Session = Depends(get_db)):
  t = TicketService(db, ticket_repo=...).get_ticket_by_id(id)
  if not t:
    raise HTTPException(status_code=404, detail="Ticket non trouvé")
  return t

@router.get("/codebarre/{codebarre}", response_model=TicketCaisse | None)
def get_ticket_by_codebarre(codebarre: int, db: Session = Depends(get_db)):
  return TicketService(db, ticket_repo=...).get_ticket_by_codebarre(codebarre)

@router.post("/", response_model=TicketCaisse, status_code=201)
def create_ticket(ticket: TicketCaisse, db: Session = Depends(get_db)):
  return TicketService(db, ticket_repo=...).create_ticket(ticket)

@router.put("/{id}", response_model=TicketCaisse)
def update_ticket(id: int, updated_ticket: TicketCaisse, db: Session = Depends(get_db)):
  return TicketService(db, ticket_repo=...).update_ticket(id, updated_ticket)

@router.delete("/{id}", status_code=204)
def delete_ticket(id: int, db: Session = Depends(get_db)):
  TicketService(db, ticket_repo=...).delete_ticket(id)
  return {"message": "deleted"}
