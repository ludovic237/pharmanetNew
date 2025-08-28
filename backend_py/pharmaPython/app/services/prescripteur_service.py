# services/prescripteur_service.py
from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.prescripteur import Prescripteur


class PrescripteurService:
  def __init__(self, db: Session):
    self.db = db

  # createPrescripteur
  def create_prescripteur(self, p: Prescripteur) -> Prescripteur:
    self.db.add(p)
    self.db.commit()
    self.db.refresh(p)
    return p

  # getAllPrescripteurs
  def get_all_prescripteurs(self) -> List[Prescripteur]:
    # Si tu veux ignorer ceux "supprimés": ajoute .filter(Prescripteur.supprimer == 0)
    return self.db.query(Prescripteur).all()

  # updatePrescripteur
  def update_prescripteur(self, id_: int, updated: Prescripteur) -> Prescripteur:
    p: Optional[Prescripteur] = (
      self.db.query(Prescripteur).filter(Prescripteur.id == id_).first()
    )
    if not p:
      raise HTTPException(status_code=404, detail="Prescripteur not found")

    # Kotlin: existingPrescripteur.nom = updatedPrescripteur.nom
    p.nom = getattr(updated, "nom", p.nom)
    self.db.commit()
    self.db.refresh(p)
    return p

  # deletePrescripteur (suppression logique)
  def delete_prescripteur(self, id_: int) -> None:
    p: Optional[Prescripteur] = (
      self.db.query(Prescripteur).filter(Prescripteur.id == id_).first()
    )
    if not p:
      raise HTTPException(status_code=404, detail="Prescripteur not found")

    # Kotlin commente deleteById et pose supprimer=1 puis save
    p.supprimer = 1
    self.db.commit()
