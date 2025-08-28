from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional

from app.models.categorie import Categorie


class CategorieService:
  def __init__(self, db: Session):
    self.db = db

  # ----------------------------
  # Créer une catégorie
  # ----------------------------
  def create_categorie(self, categorie: Categorie) -> Categorie:
    self.db.add(categorie)
    self.db.commit()
    self.db.refresh(categorie)
    return categorie

  # ----------------------------
  # Récupérer toutes les catégories non supprimées
  # ----------------------------
  def get_all_categories(self) -> List[Categorie]:
    return self.db.query(Categorie).filter(Categorie.supprimer == 0).all()

  # ----------------------------
  # Récupérer toutes les catégories (pagination manuelle)
  # ----------------------------
  def get_all_categories_page(self, skip: int = 0, limit: int = 10) -> List[Categorie]:
    return (
      self.db.query(Categorie)
      .filter(Categorie.supprimer == 0)
      .offset(skip)
      .limit(limit)
      .all()
    )

  # ----------------------------
  # Mettre à jour une catégorie
  # ----------------------------
  def update_categorie(self, id: int, updated_categorie: Categorie) -> Categorie:
    existing = self.db.query(Categorie).filter(Categorie.id == id).first()
    if not existing:
      raise HTTPException(status_code=404, detail="Categorie not found")

    existing.nom = updated_categorie.nom
    self.db.commit()
    self.db.refresh(existing)
    return existing

  # ----------------------------
  # Supprimer une catégorie (logique)
  # ----------------------------
  def delete_categorie(self, id: int):
    categorie = self.db.query(Categorie).filter(Categorie.id == id).first()
    if not categorie:
      raise HTTPException(status_code=404, detail="Categorie not found")

    categorie.supprimer = 1
    self.db.commit()
    return {"message": "Categorie supprimée"}
