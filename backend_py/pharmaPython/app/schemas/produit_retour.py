# schemas/produit_retour_dto.py
from pydantic import BaseModel

class ProduitRetourRequestDto(BaseModel):
  produitId: int
  rayonId: int
  quantiteRetour: int
