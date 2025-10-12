# services/fabriquant_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import List, Tuple, Optional
from fastapi import HTTPException

from app.models.fabriquant import Fabriquant, FabriquantCreateSchema, FabriquantSchema, FabriquantBaseSchema
from app.repositories.fabriquant_repository import FabriquantRepository


class FabriquantService:
  def __init__(self, db: Session):
    self.db = db
    self.fabriquant_repo = FabriquantRepository(db)

  def create_fabriquant(self, f: FabriquantCreateSchema) -> FabriquantSchema:
    entity = Fabriquant(**f.model_dump())
    # entity.code = 'FOR'+str(int(self.db.query(Fabriquant).count() + 2))
    entity = self.fabriquant_repo.save(entity)
    return FabriquantSchema.model_validate(entity)

  def get_all_fabriquants(self) -> List[Fabriquant]:
    return self.db.query(Fabriquant).all()

  def get_all_fabriquants_page(self, skip: int, limit: int, sort_by: str = "id", direction: str = "DESC") -> Tuple[List[Fabriquant], int]:
    q = self.db.query(Fabriquant)
    total = q.count()
    order_col = getattr(Fabriquant, sort_by, Fabriquant.id)
    q = q.order_by(desc(order_col) if direction.upper() == "DESC" else asc(order_col))
    rows = q.offset(skip).limit(limit).all()
    return rows, total

  def update_fabriquant(self, id_: int, data: FabriquantBaseSchema) -> Optional[Fabriquant]:
    f = self.db.query(Fabriquant).filter(Fabriquant.id == id_).first()
    if not f:
      return None
    # mets à jour les champs nécessaires (ex: nom, code, email, etc.)
    for attr in ["nom", "code", "email", "telephone", "adresse"]:
      if hasattr(data, attr):
        setattr(f, attr, getattr(data, attr))
    self.db.commit()
    self.db.refresh(f)
    return f

  def delete_fabriquant(self, id_: int) -> None:
    f:Fabriquant = self.db.query(Fabriquant).filter(Fabriquant.id == id_).first()
    if not f:
      raise HTTPException(status_code=404, detail="Fabriquant non trouvé")
    f.supprimer = 1
    self.db.commit()
