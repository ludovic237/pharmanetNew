from pydantic import BaseModel
from typing import Optional

class TypeSortieDto(BaseModel):
  id: Optional[int] = 0
  nom: Optional[str] = ""
  description: Optional[str] = ""
