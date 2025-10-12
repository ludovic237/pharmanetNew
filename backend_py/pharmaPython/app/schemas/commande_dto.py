from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProduitCommandeDTO(BaseModel):
  produitId: int
  quantite: int
  prixUnitaire: float


class ProduitCmdRequest(BaseModel):
  codebarre: Optional[str] = None
  productId: Optional[int] = None
  productCmdId: Optional[int] = None
  id: Optional[int] = None
  nom: Optional[str] = None
  quantite: Optional[int] = 0
  qtiteCmd: Optional[int] = 0
  uniteGratuite: Optional[int] = 0
  datePeremption: Optional[str] = None  # ISO string ou datetime si tu préfères
  prixUnitaire: Optional[float] = None
  prixVente: Optional[float] = None
  prixAchat: Optional[float] = None


class ProduitCmdRuptureRequest(BaseModel):
  productId: Optional[int] = None
  producCmdtId: Optional[int] = None
  produitEnRayontId: Optional[int] = None
  reduction: Optional[int] = 0
  quantiteRestante: Optional[int] = 0
  datePeremption: Optional[str]  # ISO string ou datetime si tu préfères
  dateLivraison: Optional[str]  # ISO string ou datetime si tu préfères
  prix: Optional[float]
  prixAchat: Optional[float]


class Produit(BaseModel):
  id: Optional[int]
  nom: str
  quantite: int
  prixUnitaire: float


class CommandeDTO(BaseModel):
  id: Optional[int]
  dateCreation: Optional[str]  # ou datetime si tu veux parser
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


class CommandeRuptureRequest(BaseModel):
  type: str
  fournisseurId: int
  produits: List[ProduitCmdRuptureRequest]


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
