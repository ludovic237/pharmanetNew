# repositories/categorie_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.categorie import Categorie  # adapte

class CategorieRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_nom(self, nom: str) -> Optional[Categorie]:
    return self.db.query(Categorie).filter(Categorie.nom == nom).first()

  def find_all_by_supprimer(self, supprimer: int) -> List[Categorie]:
    return self.db.query(Categorie).filter(Categorie.supprimer == supprimer).all()

  def find_by_nom_and_supprimer(self, nom: str, supprimer: int) -> Optional[Categorie]:
    return (
      self.db.query(Categorie)
      .filter(Categorie.nom == nom, Categorie.supprimer == supprimer)
      .first()
    )

  # helpers
  def find_by_id(self, id_: int) -> Optional[Categorie]:
    return self.db.query(Categorie).get(id_)
  def save(self, entity: Categorie) -> Categorie:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def delete(self, entity: Categorie) -> None:
    self.db.delete(entity); self.db.commit()
