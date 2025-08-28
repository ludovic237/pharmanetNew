from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProduitEnRayonDto(BaseModel):
  enRayonId: Optional[int] = None
  produitId: int
  fournisseurId: Optional[int] = None
  rayonId: Optional[int] = None
  quantite: int
  quantiteRestante: int
  reduction: int
  prixVente: Optional[int] = None
  prixAchat: Optional[int] = None
  datePeremption: Optional[datetime] = None
  dateLivraison: Optional[datetime] = None

class ProduitDetailIncrementEnRayonDto(BaseModel):
  enRayonId: Optional[str] = None
  produitDetailId: Optional[str] = None

class EnRayonDto(BaseModel):
  enRayonId: Optional[str] = None
  prixAchat: Optional[int] = 0
  prixVente: Optional[int] = 0
  reductionMax: Optional[int] = 0
  quantiteRestante: Optional[int] = 0
  datePeremption: Optional[str] = None

class EnRayonPageableCustomDto(BaseModel):
  # En Kotlin: Page<Map<String, Any?>> → ici, liste de dicts + métadonnées
  content: List[Dict[str, Any]] = []
  totalElements: Optional[int] = None
  totalPages: Optional[int] = None
  pageSize: Optional[int] = None
  pageNumber: Optional[int] = None
  totalAmountEnRayon: Optional[int] = None
  totalQte: Optional[int] = None
  data: Optional[Dict[str, Any]] = None
