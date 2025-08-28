from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.employe import Employe
from app.models.user import User


class EmployeRepository:

  def __init__(self, db: Session):
    self.db = db

  def find_by_user(self, user: User) -> Optional[Employe]:
    return self.db.query(Employe).filter(Employe.user_id == user.id).first()

  def find_by_identifiant(self, identifiant: str) -> Optional[Employe]:
    return self.db.query(Employe).filter(Employe.identifiant == identifiant).first()

  def find_by_codebarre_id(self, codebarre_id: str) -> Optional[Employe]:
    return self.db.query(Employe).filter(Employe.codebarre_id == codebarre_id).first()

  def find_all_by_supprimer_equals(self, supprimer: int = 0) -> List[Employe]:
    return self.db.query(Employe).filter(Employe.supprimer == supprimer).all()

  def save(self, employe: Employe) -> Employe:
    self.db.add(employe)
    self.db.commit()
    self.db.refresh(employe)
    return employe
