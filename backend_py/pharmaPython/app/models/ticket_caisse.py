from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Date, Boolean
from app.core.db import Base


class TicketCaisse(Base):
  __tablename__ = "ticket_caisse"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, autoincrement=True)
  codebarre = Column(Integer)
  montant = Column(Integer)
  date_genere = Column(Date)
  statut = Column(String(15))
  validite = Column(Integer)
  supprimer = Column(Integer, default=0)


class TicketCaisseSchema(BaseModel):
  id: int
  codebarre: str
  montant: int
  date_genere: datetime
  statut: str
  validite: int
  supprimer: int

  # v2 : remplace orm_mode = True
  model_config = {"from_attributes": True}


class TicketCaisseIn(BaseModel):
  codebarre: str
  montant: int
  date_genere: datetime
  statut: str
  validite: int
  supprimer: int
