# repositories/produit_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, not_

from app.models.en_rayon import EnRayon
from app.models.produit import Produit


class ProduitRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_code_ubipharm_and_supprimer(self, codebarre: str, supprimer: int = 0) -> Optional[Produit]:
    return (
      self.db.query(Produit)
      .filter(Produit.codeUbipharm == codebarre, Produit.supprimer == supprimer)
      .first()
    )

  def find_all_by_supprimer(self, supprimer: int = 0) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.supprimer == supprimer).all()

  def find_by_nom_containing_ignore_case_and_supprimer(self, nom: str, supprimer: int = 0) -> List[Produit]:
    return (
      self.db.query(Produit)
      .filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"), Produit.supprimer == supprimer)
      .all()
    )

  def find_by_nom_containing_ignore_case(self, nom: str) -> List[Produit]:
    return (
      self.db.query(Produit)
      .filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"))
      .all()
    )

  def find_by_nom_containing(self, nom: str) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.nom.like(f"%{nom}%")).all()

  def find_by_detail_id(self, detail_id: int) -> List[Produit]:
    return self.db.query(Produit).filter(Produit.detailId == detail_id).all()

  def find_by_id_and_detail_id(self, product_id: int, product_detail_id: int) -> Optional[Produit]:
    return (
      self.db.query(Produit)
      .filter(Produit.id == product_id, Produit.detailId == product_detail_id)
      .first()
    )

  def find_by_nom_containing_ignore_case_pageable(
    self, nom: str, page: int, size: int
  ) -> Tuple[List[Produit], int]:
    query = self.db.query(Produit).filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"))
    total = query.count()
    rows = query.offset(page * size).limit(size).all()
    return rows, total

  def find_produits_non_en_rayon(self) -> List[Produit]:
    subq = self.db.query(EnRayon.produit_id).subquery()
    return self.db.query(Produit).filter(~Produit.id.in_(subq)).all()

  # Équivalent de ProduitSpecification.withFilters(...)
  def filter_with_spec(
    self,
    query: Optional[str],
    rayon_id: Optional[int],
    fabriquant_id: Optional[int],
    etagere_id: Optional[int],
    forme_id: Optional[int],
    magasin_id: Optional[int],
    categorie_id: Optional[int],
    page: int,
    size: int,
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit)
    if query:
      q = q.filter(func.lower(Produit.nom).like(f"%{query.lower()}%"))
    if rayon_id:
      q = q.filter(Produit.rayon_id == rayon_id)
    if fabriquant_id:
      q = q.filter(Produit.fabriquant_id == fabriquant_id)
    if etagere_id:
      q = q.filter(Produit.etagere_id == etagere_id)
    if forme_id:
      q = q.filter(Produit.forme_id == forme_id)
    if magasin_id:
      q = q.filter(Produit.magasin_id == magasin_id)
    if categorie_id:
      q = q.filter(Produit.categorie_id == categorie_id)

    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total
