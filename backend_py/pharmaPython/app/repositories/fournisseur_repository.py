from sqlalchemy.orm import Session
from typing import Optional

from app.models.fournisseur import Fournisseur
from app.models.user import User


class FournisseurRepository:
  def __init__(self, db: Session): self.db = db

  def find_by_id(self, id_: int) -> Optional[Fournisseur]:
    return self.db.query(Fournisseur).filter(Fournisseur.id == id_).first()
