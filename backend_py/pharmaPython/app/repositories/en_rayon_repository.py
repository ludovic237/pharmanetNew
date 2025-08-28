from datetime import datetime

from sqlalchemy.orm import Session
from typing import Optional

from app.models.en_rayon import EnRayon
from app.models.fournisseur import Fournisseur
from app.models.user import User


class EnRayonRepository:
  def __init__(self, db: Session): self.db = db

  def add_mouvement(self, produit_id: int, quantite: int):
    # Simplifié : trace un mouvement d’entrée (réception) en stock
    enr = EnRayon(produit_id=produit_id, quantite=quantite, date=datetime.utcnow())
    self.db.add(enr);
    self.db.commit();
    return enr
