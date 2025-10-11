# repositories/bon_caisse_repository.py
from typing import List, Optional, Type
from sqlalchemy.orm import Session
from app.models.bon_caisse import BonCaisse  # adapte
# repositories/vente_repository.py

from typing import List, Optional, Tuple, Dict, Any, Iterable
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy.sql.elements import BinaryExpression

from app.services.inventaire_service import _order_by


class BonCaisseRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_all(self) -> list[Type[BonCaisse]]:
    return self.db.query(BonCaisse).all()

  def find_by_codebarre_id(self, codebarre_id: str) -> Optional[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.codebarre_id == codebarre_id)
      .first()
    )

  def find_generated_by_caisse_id(self, caisse_id: str) -> List[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.caisse_id == caisse_id, BonCaisse.type == "Générer")
      .all()
    )

  def find_encaisse_by_caisse_id(self, caisse_id: str) -> List[BonCaisse]:
    return (
      self.db.query(BonCaisse)
      .filter(BonCaisse.caisse_id == caisse_id, BonCaisse.type == "Encaisser")
      .all()
    )

  # helpers
  def save(self, entity: BonCaisse) -> BonCaisse:
    self.db.add(entity); self.db.commit(); self.db.refresh(entity); return entity
  def find_by_id(self, id_: int) -> Optional[BonCaisse]:
    return self.db.query(BonCaisse).get(id_)
  def delete(self, entity: BonCaisse) -> None:
    self.db.delete(entity); self.db.commit()

  def find_all_pageable(self, page: int, size: int, sort: str, direction: str) -> Tuple[List[BonCaisse], int]:
    q = self.db.query(BonCaisse).order_by(_order_by(BonCaisse, sort, direction))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return rows, total

  def find_all_pageable_spec(
    self,
    spec: Dict[str, Any] | Iterable[BinaryExpression] | None = None,
    page: int = 0,
    size: int = 10,
    sort: str = "dateVente",
    direction: str = "DESC",
  ) -> Tuple[List[BonCaisse], int]:
    q = self.db.query(BonCaisse)

    # Accepte dict OU liste/tuple de filtres SQLAlchemy
    if spec:
      # cas 1: dictionnaire clé/valeur
      if isinstance(spec, dict):
        for key, value in spec.items():
          if value is None or (isinstance(value, str) and value.lower() == "null"):
            continue
          column = getattr(BonCaisse, key, None)
          if column is not None:
            q = q.filter(column == value)
      # cas 2: itérable de BinaryExpression (ex: [BonCaisse.etat == "VALIDE", BonCaisse.supprimer == 0])
      elif isinstance(spec, (list, tuple)):
        from sqlalchemy.sql.elements import BinaryExpression
        filters = [f for f in spec if isinstance(f, BinaryExpression)]
        if filters:
          q = q.filter(*filters)

    total = q.count()

    sort_col = getattr(BonCaisse, sort, getattr(BonCaisse, "dateBonCaisse", BonCaisse.id))
    sort_col = sort_col.desc() if direction.upper() == "DESC" else sort_col.asc()
    rows = q.order_by(sort_col).offset(page * size).limit(size).all()
    return rows, total

  def filter_bon_caisse_range(
    self,
    *,
    caisse_id: Optional[int],
    caisse_id_encaisser: Optional[int],
    nom_client: Optional[int],
    type: Optional[int],
    supprimer: Optional[int],
    start_date_generer: Optional[str],
    end_date_generer: Optional[str],
    start_date_encaisser: Optional[str],
    end_date_encaisser: Optional[str],
    page: int = 0,
    size: int = 10,
    sort_by: str = "id",
    direction: str = "DESC",
  ) -> Tuple[List[BonCaisse], int]:
    q = self.db.query(BonCaisse)

    # plage de dates sur date_vente (Kotlin parse LocalDateTime des strings données)
    if start_date_generer and end_date_generer:
      start_dt = datetime.fromisoformat(start_date_generer.strip())
      end_dt = datetime.fromisoformat(end_date_generer.strip())
      q = q.filter(BonCaisse.date_generer.between(start_dt, end_dt))

    if start_date_encaisser and end_date_encaisser:
      start_dt = datetime.fromisoformat(start_date_encaisser.strip())
      end_dt = datetime.fromisoformat(end_date_encaisser.strip())
      q = q.filter(BonCaisse.date_encaisser.between(start_dt, end_dt))

    if type and type != "null":
      q = q.filter(BonCaisse.type == type)

    if nom_client and nom_client != "null":
      q = q.filter(BonCaisse.nom_client == nom_client)

    if caisse_id is not None:
      q = q.filter(BonCaisse.caisse_id == caisse_id)

    if caisse_id_encaisser is not None:
      q = q.filter(BonCaisse.caisse_id_encaisser == caisse_id_encaisser)

    if supprimer is not None:
      q = q.filter(BonCaisse.supprimer == supprimer)

    total = q.count()

    col = getattr(BonCaisse, sort_by, BonCaisse.id)
    col = col.desc() if direction.upper() == "DESC" else col.asc()
    rows = q.order_by(col).offset(page * size).limit(size).all()
    return rows, total
