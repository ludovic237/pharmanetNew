from pydantic import BaseModel
from typing import Optional

class UserNewDto(BaseModel):
  nom: Optional[str] = None
  prenom: Optional[str] = None
  email: Optional[str] = None
  fonction: Optional[str] = None
  reduction: Optional[str] = None
  telephone: Optional[str] = None
  reductionMax: Optional[str] = None
  reductionFait: Optional[str] = None
  id: Optional[str] = None
