# repositories/depense_repository.py
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.depense import Depense

class DepenseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_caisse_id(self, caisse_id: str) -> List[Depense]:
    return self.db.query(Depense).filter(Depense.caisse_id == caisse_id).all()

  def kpi_depenses(self, start: datetime, end: datetime) -> float:
    sql = text("""
            SELECT COALESCE(SUM(prix_unitaire*quantite),0)
            FROM depense
            WHERE supprimer=0 AND date_depense BETWEEN :from AND :to
        """)
    val = self.db.execute(sql, {"from": start, "to": end}).scalar()
    return float(val or 0.0)
