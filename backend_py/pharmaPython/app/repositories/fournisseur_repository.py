# repositories/fournisseur_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.fournisseur import Fournisseur  # adapte

class FournisseurRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_email_and_supprimer(self, email: str, supprimer: int) -> Optional[Fournisseur]:
    return (
      self.db.query(Fournisseur)
      .filter(func.lower(Fournisseur.email) == email.lower(),
              Fournisseur.supprimer == supprimer)
      .first()
    )

  def find_by_email(self, email: str) -> Optional[Fournisseur]:
    return (
      self.db.query(Fournisseur)
      .filter(func.lower(Fournisseur.email) == email.lower())
      .first()
    )

  def find_all_by_supprimer(self, supprimer: int = 0) -> List[Fournisseur]:
    return self.db.query(Fournisseur).filter(Fournisseur.supprimer == supprimer).all()

  # helpers
  def find_by_id(self, id_: int) -> Optional[Fournisseur]:
    return self.db.query(Fournisseur).get(id_)
  def save(self, entity: Fournisseur) -> Fournisseur:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: Fournisseur) -> None:
    self.db.delete(entity); self.db.commit()
