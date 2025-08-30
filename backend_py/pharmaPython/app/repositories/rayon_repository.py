# repositories/rayon_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.rayon import Rayon  # adapte le chemin

class RayonRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_nom_and_supprimer(self, nom: str, supprimer: int = 0) -> Optional[Rayon]:
    return (
      self.db.query(Rayon)
      .filter(func.lower(Rayon.nom) == nom.lower(), Rayon.supprimer == supprimer)
      .first()
    )

  def find_by_nom(self, nom: str) -> bool:
    return (
      self.db.query(Rayon.id)
      .filter(func.lower(Rayon.nom) == nom.lower())
      .first()
      is not None
    )

  def find_by_nom_containing_ignore_case(self, nom: str) -> List[Rayon]:
    return (
      self.db.query(Rayon)
      .filter(func.lower(Rayon.nom).like(f"%{nom.lower()}%"))
      .all()
    )

  def find_all_by_supprimer(self, supprimer: int = 0) -> List[Rayon]:
    return self.db.query(Rayon).filter(Rayon.supprimer == supprimer).all()

  # helpers
  def find_by_id(self, id_: int) -> Optional[Rayon]:
    return self.db.query(Rayon).get(id_)

  def save(self, entity: Rayon) -> Rayon:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def delete(self, entity: Rayon) -> None:
    self.db.delete(entity); self.db.commit()
