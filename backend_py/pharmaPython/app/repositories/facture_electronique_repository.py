# repositories/facture_electronique_repository.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.facture_electronique import FactureElectronique  # adapte le chemin

class FactureElectroniqueRepository:
  def __init__(self, db: Session):
    self.db = db

  def find_by_facturation_id(self, facturation_id: int) -> Optional[FactureElectronique]:
    return (
      self.db.query(FactureElectronique)
      .filter(FactureElectronique.facturation_id == facturation_id)
      .first()
    )

  def exists_by_facturation_id(self, facturation_id: int) -> bool:
    return (
      self.db.query(FactureElectronique.id)
      .filter(FactureElectronique.facturation_id == facturation_id)
      .first()
      is not None
    )

  # helpers
  def save(self, entity: FactureElectronique) -> FactureElectronique:
    self.db.add(entity); self.db.commit();
    self.db.refresh(entity);
    return entity

  def find_by_id(self, id_: int) -> Optional[FactureElectronique]:
    return self.db.query(FactureElectronique).get(id_)

  def delete(self, entity: FactureElectronique) -> None:
    self.db.delete(entity); self.db.commit()
