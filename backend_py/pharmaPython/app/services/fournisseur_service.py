# services/fournisseur_service.py
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException

from app.models.fournisseur import Fournisseur


class FournisseurService:
  def __init__(self, db: Session):
    self.db = db

  def create_fournisseur(self, f: Fournisseur) -> Fournisseur:
    self.db.add(f);
    self.db.commit();
    self.db.refresh(f);
    return f

  def get_all_fournisseurs(self) -> List[Fournisseur]:
    return self.db.query(Fournisseur).all()

  def update_fournisseur(self, id_: int, data: Fournisseur) -> Optional[Fournisseur]:
    f = self.db.query(Fournisseur).filter(Fournisseur.id == id_).first()
    if not f: return None
    for attr in ["nom", "code", "email", "telephone", "adresse", "statut"]:
      if hasattr(data, attr):
        setattr(f, attr, getattr(data, attr))
    self.db.commit();
    self.db.refresh(f);
    return f

  def delete_fournisseur(self, id_: int) -> None:
    f:Fournisseur = self.db.query(Fournisseur).filter(Fournisseur.id == id_).first()
    if not f: raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    # self.db.delete(f);
    f.supprimer = 1
    self.db.commit()
