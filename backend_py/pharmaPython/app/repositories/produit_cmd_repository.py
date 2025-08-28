from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.produit_cmd import ProduitCmd
from app.models.user import User


class ProduitCmdRepository:
  def __init__(self, db: Session): self.db = db

  def find_by_commande(self, commande_id: int) -> List[ProduitCmd]:
    return self.db.query(ProduitCmd).filter(ProduitCmd.commande_id == commande_id).all()

  def find_by_id(self, id_: int) -> Optional[ProduitCmd]:
    return self.db.query(ProduitCmd).filter(ProduitCmd.id == id_).first()

  def save(self, pc: ProduitCmd) -> ProduitCmd:
    self.db.add(pc);
    self.db.commit();
    self.db.refresh(pc);
    return pc
