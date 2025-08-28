import unicodedata
from sqlalchemy.orm import Session
from app.models.caisse import Caisse
from app.models.employe import Employe


class UserUtils:
  def __init__(self, db: Session):
    self.db = db

  def get_current_employe_id(self, employe: Employe):
    if employe and employe.id:
      return employe.id
    return None

  def get_current_employe(self, employe: Employe):
    return employe if employe and employe.id else None

  def remove_accent(self, input_str: str) -> str:
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)]).lower()

  def get_active_caisse(self) -> Caisse | None:
    return self.db.query(Caisse).filter(Caisse.etat == "En cours", Caisse.supprimer == 0).order_by(Caisse.id.desc()).first()
