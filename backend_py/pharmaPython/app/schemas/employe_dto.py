from pydantic import BaseModel
from typing import Optional

from app.schemas.auth_dto import RegisterRequest


class EmployeNewDto(BaseModel):
  codebarreId: Optional[str] = None
  etat: Optional[str] = None
  faireReductionMax: Optional[str] = None
  id: Optional[int] = None
  identifiant: Optional[str] = None
  images: Optional[str] = None
  password: Optional[str] = None
  type: Optional[str] = None
  user: Optional[str] = None

class EmployeDto(BaseModel):
  identifiant: str = None
  model_config = {"from_attributes": True}

class UserEmployeeRequest(BaseModel):
  registerRequest: RegisterRequest
  employee: EmployeDto
  model_config = {"from_attributes": True}
