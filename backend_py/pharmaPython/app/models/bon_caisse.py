from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.db import Base

class BonCaisse(BaseModel):
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
