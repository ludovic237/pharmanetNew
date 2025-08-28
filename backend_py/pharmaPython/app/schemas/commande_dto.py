from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProduitCommandeDTO(BaseModel):
  produitId: int
  quantite: int
  prixUnitaire: float


class ProduitCmdRequest(BaseModel):
  codebarre: Optional[str]
  productId: Optional[int]
  productCmdId: Optional[int]
  id: Optional[int]
  nom: Optional[str]
  quantite: Optional[int] = 0
  quantiteRecu: Optional[int] = 0
  uniteGratuite: Optional[int] = 0
  dateDePeremption: Optional[str]  # ISO string ou datetime si tu préfères
  prixUnitaire: Optional[float]
  prixVente: Optional[float]
  prixAchat: Optional[float]


class Produit(BaseModel):
  id: Optional[int]
  nom: str
  quantite: int
  prixUnitaire: float


class CommandeDTO(BaseModel):
  id: Optional[int]
  dateCreation: Optional[str]   # ou datetime si tu veux parser
  dateLivraison: Optional[str]
  fournisseurId: Optional[int]
  produits: List[ProduitCommandeDTO]
  montantTotal: Optional[float]
  etat: Optional[str]
  note: Optional[str]


class CommandeNewDTO(BaseModel):
  id: Optional[int]
  nom: Optional[str]
  prix: Optional[int]
  stock: Optional[int]
  fournisseur: Optional[str]
  dateLivraison: Optional[str]
  datePeremption: Optional[str]
  quantiteStock: Optional[int]
  prixAchat: Optional[int]
  quantiteRestante: Optional[int]


class CommandeRequest(BaseModel):
  clientId: int
  type: str
  employeId: int
  fournisseurId: int
  produits: List[ProduitCmdRequest]


class CommandePageableCustomlDto(BaseModel):
  content: Optional[List[Dict[str, Any]]]
  totalElements: Optional[int]
  totalPages: Optional[int]
  pageSize: Optional[int]
  pageNumber: Optional[int]
  totalAmountRecu: Optional[float]
  totalAmountCommande: Optional[float]
  totalQteRecu: Optional[int]
  totalQteCommande: Optional[int]
