from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from passlib.context import CryptContext

from app.models.employe import Employe
from app.models.user import User
from app.repositories.employe_repository import EmployeRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth_dto import RegisterRequest
from app.schemas.employe_dto import EmployeNewDto

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class EmployeService:
  def __init__(self, db: Session):
    self.db = db
    self.employe_repo = EmployeRepository(db)
    self.user_repo = UserRepository(db)

  def create_employee(self, register_request: RegisterRequest, employe_dto: EmployeDto) -> Employe:
    if self.user_repo.exists_by_email(register_request.email):
      raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
      nom=register_request.first_name,
      prenom=register_request.last_name,
      telephone=register_request.phone,
      email=register_request.email,
      supprimer=0,
      fonction=register_request.role,
    )
    user = self.user_repo.save(user)

    employe = Employe(
      password=pwd_context.hash(register_request.password),
      user_id=user.id,
      identifiant=employe_dto.identifiant,
    )
    return self.employe_repo.save(employe)

  def get_all_employees(self) -> List[Employe]:
    return self.employe_repo.find_all_by_supprimer_equals()

  def get_employee_by_id(self, id: int) -> Optional[Employe]:
    return self.employe_repo.find_by_id(id)

  def update_employee(self, id: int, updated_employe: EmployeNewDto) -> Employe:
    user = self.user_repo.find_by_id(updated_employe.user)
    if not user:
      raise HTTPException(status_code=404, detail="User not found")

    if id == 0:
      employe = Employe(
        identifiant=updated_employe.identifiant,
        password=updated_employe.password,
        codebarre_id=updated_employe.codebarre_id,
        type=updated_employe.type,
        user_id=user.id,
        etat=updated_employe.etat,
        faire_reduction_max=updated_employe.faire_reduction_max,
        supprimer=0
      )
    else:
      employe = self.employe_repo.find_by_id(id)
      if not employe:
        raise HTTPException(status_code=404, detail="Employee not found")

      employe.identifiant = updated_employe.identifiant
      employe.password = updated_employe.password
      employe.codebarre_id = updated_employe.codebarre_id
      employe.type = updated_employe.type
      employe.user_id = user.id
      employe.etat = updated_employe.etat
      employe.faire_reduction_max = updated_employe.faire_reduction_max
      employe.supprimer = 0

    return self.employe_repo.save(employe)

  def delete_employee(self, id: int):
    employe = self.employe_repo.find_by_id(id)
    if not employe:
      raise HTTPException(status_code=404, detail=f"Employee not found with ID: {id}")

    employe.supprimer = 1
    self.employe_repo.save(employe)
