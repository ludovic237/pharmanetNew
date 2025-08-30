# repositories/type_sortie_repository.py
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.type_sortie import TypeSortie   # adapte
from app.models.produit import Produit          # adapte

class TypeSortieRepository:
  def __init__(self, db: Session):
    self.db = db

  # ---- "Specification" : filtre sur le nom du produit lié ----
  def filter_type_sortie(
    self,
    nom: Optional[str] = None,
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[TypeSortie], int]:
    q = self.db.query(TypeSortie).options(joinedload(TypeSortie.produit))

    if nom and nom != "null":
      q = q.join(TypeSortie.produit).filter(
        func.lower(Produit.nom).like(f"%{nom.lower()}%")
      )

    total = q.count()
    col = getattr(TypeSortie, sort_by, TypeSortie.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total

  # ---- helpers CRUD ----
  def find_all(self) -> List[TypeSortie]:
    return self.db.query(TypeSortie).all()

  def find_by_id(self, id_: int) -> Optional[TypeSortie]:
    return self.db.query(TypeSortie).get(id_)

  def save(self, entity: TypeSortie) -> TypeSortie:
    self.db.add(entity)
    self.db.commit()
    self.db.refresh(entity)
    return entity

  def delete(self, entity: TypeSortie) -> None:
    self.db.delete(entity)
    self.db.commit()
