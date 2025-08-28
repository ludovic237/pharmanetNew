from sqlalchemy import Column, Integer, String, Date, Boolean
from app.core.db import Base

class TicketCaisse(Base):
  __tablename__ = "ticket_caisse"

  id = Column(Integer, primary_key=True, autoincrement=True)
  codebarre = Column(Integer)
  montant = Column(Integer)
  date_genere = Column(Date)
  statut = Column(String(15))
  validite = Column(Integer)
  supprimer = Column(Integer, default=0)
