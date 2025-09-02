# repositories/produit_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple, Dict, Any, Iterable
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.produit import Produit
from app.models.en_rayon import EnRayon
from sqlalchemy.sql.elements import BinaryExpression

class ProduitRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all_by_spec(
    self,
    spec: Dict[str, Any] | Iterable[BinaryExpression] | None = None,
    page: int = 0,
    size: int = 10,
    sort: str = "dateVente",
    direction: str = "DESC",
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit)

    # Accepte dict OU liste/tuple de filtres SQLAlchemy
    if spec:
      # cas 1: dictionnaire clé/valeur
      if isinstance(spec, dict):
        for key, value in spec.items():
          if value is None or (isinstance(value, str) and value.lower() == "null"):
            continue
          column = getattr(Produit, key, None)
          if column is not None:
            q = q.filter(column == value)
      # cas 2: itérable de BinaryExpression (ex: [Vente.etat == "VALIDE", Vente.supprimer == 0])
      elif isinstance(spec, (list, tuple)):
        from sqlalchemy.sql.elements import BinaryExpression
        filters = [f for f in spec if isinstance(f, BinaryExpression)]
        if filters:
          q = q.filter(*filters)

    total = q.count()

    sort_col = getattr(Produit, sort, getattr(Produit, "id", Produit.id))
    sort_col = sort_col.desc() if direction.upper() == "DESC" else sort_col.asc()
    rows = q.order_by(sort_col).offset(page * size).limit(size).all()
    return rows, total

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
    return self.db.query(Produit).filter(Produit.detail_id == detail_id).all()

  def find_by_id_and_detail_id(self, product_id: int, product_detail_id: int) -> Optional[Produit]:
    return (
      self.db.query(Produit)
      .filter(Produit.id == product_id, Produit.detail_id == product_detail_id)
      .first()
    )

  def find_by_nom_containing_ignore_case_pageable(
    self, nom: str, page: int, size: int
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit).filter(func.lower(Produit.nom).like(f"%{nom.lower()}%"))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_produits_non_en_rayon(self) -> List[Produit]:
    subq = self.db.query(EnRayon.produit_id).subquery()
    return self.db.query(Produit).filter(~Produit.id.in_(subq)).all()

  # ---- "Specification" Kotlin: withFilters(...) ----
  def filter_with_spec(
    self,
    query: Optional[str],
    rayon_id: Optional[str],
    fabriquant_id: Optional[str],
    etagere_id: Optional[str],
    forme_id: Optional[str],
    magasin_id: Optional[str],
    categorie_id: Optional[str],
    page: int,
    size: int,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[Produit], int]:
    q = self.db.query(Produit)

    if query:
      q = q.filter(func.lower(Produit.nom).like(f"%{query.lower()}%"))
    if rayon_id and rayon_id != "null":
      q = q.filter(Produit.rayon_id == int(rayon_id))
    if fabriquant_id and fabriquant_id != "null":
      q = q.filter(Produit.fabriquant_id == int(fabriquant_id))
    if etagere_id and etagere_id != "null":
      q = q.filter(Produit.etagere_id == int(etagere_id))
    if forme_id and forme_id != "null":
      q = q.filter(Produit.forme_id == int(forme_id))
    if magasin_id and magasin_id != "null":
      q = q.filter(Produit.magasin_id == int(magasin_id))
    if categorie_id and categorie_id != "null":
      q = q.filter(Produit.categorie_id == int(categorie_id))

    total = q.count()
    col = getattr(Produit, sort_by, Produit.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # helpers
  def find_by_id(self, id_: int) -> Optional[Produit]:
    return self.db.query(Produit).get(id_)
  def save(self, entity: Produit) -> Produit:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity

  def find_all(self) -> List:
    return self.db.query(Produit).all()
