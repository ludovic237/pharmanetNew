# repositories/produit_retour_repository.py
from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.produit_retour import ProduitRetour
from app.models.retour_produit import RetourProduit

class ProduitRetourRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_retour_produit_id(self, retour_produit_id: int) -> List[ProduitRetour]:
    return (
      self.db.query(ProduitRetour)
      .filter(ProduitRetour.retour_produit_id == retour_produit_id)
      .all()
    )

  def find_by_retour_produit_in(self, retour_produits: List[RetourProduit]) -> List[ProduitRetour]:
    ids = [r.id for r in retour_produits]
    if not ids:
      return []
    return (
      self.db.query(ProduitRetour)
      .filter(ProduitRetour.retour_produit_id.in_(ids))
      .all()
    )

  # helpers
  def save(self, entity: ProduitRetour) -> ProduitRetour:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[ProduitRetour]:
    return self.db.query(ProduitRetour).get(id_)
  def delete(self, entity: ProduitRetour) -> None:
    self.db.delete(entity); self.db.commit()
