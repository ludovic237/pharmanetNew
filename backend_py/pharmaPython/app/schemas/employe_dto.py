from pydantic import BaseModel
from typing import Optional

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
