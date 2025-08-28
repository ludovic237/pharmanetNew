from pydantic import BaseModel
from typing import Optional, List

class ProduitInventaireDto(BaseModel):
  produitId: int
  rayonId: int
  quantiteReel: int
  quantiteSysteme: int

class InventaireRequestDto(BaseModel):
  dateDeDebut: str
  produitList: List[ProduitInventaireDto]

class InventaireNewCreatetDto(BaseModel):
  rayonId: Optional[str] = None
  categorieId: Optional[str] = None
  fabriquantId: Optional[str] = None
  formeId: Optional[str] = None
  fournisseurId: Optional[str] = None

class InventaireUpdateRequestDto(BaseModel):
  id: str
  produitList: List[ProduitInventaireDto]

class InventaireOneProductUpdateRequestDto(BaseModel):
  id: Optional[str] = None
  produitId: Optional[int] = None
  rayonId: Optional[int] = None
  quantiteReel: Optional[int] = None
  quantiteSysteme: Optional[int] = None
  isValid: Optional[bool] = False
