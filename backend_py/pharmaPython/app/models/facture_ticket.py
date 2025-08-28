from sqlalchemy import Column, Integer
from app.core.db import Base

class FactureTicket(Base):
  __tablename__ = "facture_ticket"

  id = Column(Integer, primary_key=True)
  facturation_id = Column(Integer)
  ticket_caisse_id = Column(Integer)
  montant = Column(Integer)
  supprimer = Column(Integer, default=0)
