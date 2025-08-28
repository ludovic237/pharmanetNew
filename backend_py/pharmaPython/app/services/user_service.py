# services/user_service.py
from sqlalchemy.orm import Session

class UserService:
  def __init__(self, db: Session, user_repo):
    self.db = db
    self.user_repo = user_repo

  def get_all_users(self):
    return self.user_repo.find_all()

  def get_user_by_id(self, id_: int):
    return self.user_repo.find_by_id(id_)

  def create_user(self, user):
    return self.user_repo.save(user)

  def update_user(self, id_: int, dto):
    if id_ == 0:
      user = {
        "nom": dto.nom, "prenom": dto.prenom, "email": dto.email,
        "username": None, "password": None, "role": None,
        "telephone": dto.telephone,
        "reduction": dto.reduction, "reductionMax": dto.reductionMax,
        "supprimer": 0
      }
      return self.user_repo.save(user)
    else:
      u = self.user_repo.find_by_id(id_)
      if not u:
        raise ValueError(f"User {id_} not found")
      u.nom, u.prenom, u.email = dto.nom, dto.prenom, dto.email
      u.username, u.password, u.role = None, None, None
      u.telephone = dto.telephone
      u.reduction = dto.reduction
      u.reductionMax = dto.reductionMax
      u.supprimer = 0
      return self.user_repo.save(u)

  def delete_user(self, id_: int):
    u = self.user_repo.find_by_id(id_)
    if not u:
      raise ValueError(f"User {id_} not found")
    u.supprimer = 1
    return self.user_repo.save(u)

  def get_current_user(self, username: str):
    return self.user_repo.find_by_email(username)
