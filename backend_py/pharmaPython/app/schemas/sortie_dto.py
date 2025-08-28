from pydantic import BaseModel
from typing import Optional, List

class Enrayon(BaseModel):
  contenuDetail: Optional[str] = None
  id: Optional[int] = None
  quantite: Optional[int] = None
  rayonId: Optional[str] = None
  stockTotal: Optional[int] = None

class SortieDetailDto(BaseModel):
  enrayon: Optional[List[Enrayon]] = None
  produitDetailId: Optional[int] = None
  typeSortieId: Optional[int] = None
