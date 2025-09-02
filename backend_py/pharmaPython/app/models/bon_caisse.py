from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base


class BonCaisse(Base):
  __tablename__ = "bon_caisse"
  __table_args__ = {"extend_existing": True}

  id = Column(Integer, primary_key=True, index=True)
  caisse_id = Column(Integer, ForeignKey("caisse.id"))
  caisse = relationship("Caisse", lazy="joined")
  caisse_id_encaisser = Column(Integer)
  nom_client = Column(String(100))
  codebarre_id = Column(String(50))
  montant = Column(Integer)
  date_generer = Column(DateTime)
  date_encaisser = Column(DateTime)
  type = Column(String(50))
  supprimer = Column(Integer, default=0)

class BonCaisseSchema(BaseModel):
  id: int
  codebarre: Optional[int] = None
  montant: Optional[int] = None
  statut: Optional[str] = None
  validite: Optional[date] = None
  type: Optional[str] = None
  dateGenere: Optional[date] = None
  dateEncaisser: Optional[datetime] = None
  caisseIdEncaisser: Optional[int] = None
  supprimer: Optional[int] = 0

  # Pydantic v2
  model_config = {"from_attributes": True}
  # (en v1: class Config: orm_mode = True)
