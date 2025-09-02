# repositories/produit_cmd_repository.py
from __future__ import annotations
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.models.produit_cmd import ProduitCmd
from app.models.produit import Produit


class ProduitCmdRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_id(self, id_: int) -> Optional[ProduitCmd]:
    return self.db.query(ProduitCmd).get(id_)

  def find_by_commande_id(self, commande_id: int) -> List[ProduitCmd]:
    return (
      self.db.query(ProduitCmd)
      .filter(ProduitCmd.commande_id == commande_id)
      .all()
    )

  def find_by_commande_id_and_produit(self, commande_id: int, produit: Produit) -> Optional[ProduitCmd]:
    return (
      self.db.query(ProduitCmd)
      .filter(
        ProduitCmd.commande_id == commande_id,
        ProduitCmd.produit_id == produit.id
      )
      .first()
    )

  def find_by_produit(self, produit: Produit) -> List[ProduitCmd]:
    return (
      self.db.query(ProduitCmd)
      .filter(ProduitCmd.produit_id == produit.id)
      .all()
    )

  def find_by_commande_id_and_id(self, commande_id: int, id_: int) -> Optional[ProduitCmd]:
    return (
      self.db.query(ProduitCmd)
      .filter(ProduitCmd.commande_id == commande_id, ProduitCmd.id == id_)
      .first()
    )

  # Équivalent de @Query findByCommandeDateBetweenWithProduitId(..., pageable)
  def find_by_commande_date_between_with_produit_id_page(
    self,
    start_date: datetime,
    end_date: datetime,
    produit_id: int,
    page: int,
    size: int,
  ) -> Tuple[List[ProduitCmd], int]:
    q = (
      self.db.query(ProduitCmd)
      .options(joinedload(ProduitCmd.commande))
      .filter(
        ProduitCmd.produit_id == produit_id,
        ProduitCmd.commande.has(  # filtre sur la relation Commande.dateCreation
          func.date(ProduitCmd.commande.property.mapper.class_.dateCreation).between(start_date, end_date)
        )
      )
    )
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  # Companion Spec: dateBetweenWithProduitId(...)
  def spec_date_between_with_produit_id_page(
    self,
    start_date: datetime,
    end_date: datetime,
    produit_id: Optional[str],
    page: int,
    size: int,
  ) -> Tuple[List[ProduitCmd], int]:
    q = self.db.query(ProduitCmd).options(joinedload(ProduitCmd.commande))
    q = q.filter(ProduitCmd.commande.has(
      func.date(ProduitCmd.commande.property.mapper.class_.dateCreation).between(start_date, end_date)
    ))
    if produit_id and produit_id != "null":
      q = q.filter(ProduitCmd.produit_id == int(produit_id))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total
