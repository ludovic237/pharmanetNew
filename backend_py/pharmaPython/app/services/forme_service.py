# services/forme_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Tuple, Optional
from fastapi import HTTPException

from app.models.forme import Forme


class FormeService:
  def __init__(self, db: Session):
    self.db = db

  def create_forme(self, f: Forme) -> Forme:
    self.db.add(f);
    self.db.commit();
    self.db.refresh(f);
    return f

  def get_all_formes(self) -> List[Forme]:
    return self.db.query(Forme).all()

  def get_all_formes_page(self, skip: int, limit: int, sort_by: str = "id", direction: str = "DESC") -> Tuple[
    List[Forme], int]:
    q = self.db.query(Forme)
    total = q.count()
    col = getattr(Forme, sort_by, Forme.id)
    q = q.order_by(desc(col) if direction.upper() == "DESC" else asc(col))
    return q.offset(skip).limit(limit).all(), total

  def update_forme(self, id_: int, data: Forme) -> Optional[Forme]:
    f = self.db.query(Forme).filter(Forme.id == id_).first()
    if not f: return None
    # mets à jour ici les champs nécessaires de Forme (ex.: nom, code)
    for attr in ["nom", "code"]:
      if hasattr(data, attr):
        setattr(f, attr, getattr(data, attr))
    self.db.commit();
    self.db.refresh(f);
    return f

  def delete_forme(self, id_: int) -> None:
    f = self.db.query(Forme).filter(Forme.id == id_).first()
    if not f: raise HTTPException(status_code=404, detail="Forme non trouvée")
    self.db.delete(f);
    self.db.commit()
