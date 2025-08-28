from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ProduitRequestDto(BaseModel):
  ean13: Optional[str] = None
  codebarre: Optional[str] = None
  codeLaborex: Optional[str] = None
  codeUbipharm: Optional[str] = None
  reference: Optional[str] = None
  nom: Optional[str] = None
  stock: Optional[int] = None
  stockMax: Optional[int] = None
  stockMin: Optional[int] = None
  contenuDetail: Optional[str] = None
  prixDetail: Optional[int] = None
  margeBeneficiaire: Optional[Decimal] = None
  tva: Optional[Decimal] = None
  etat: Optional[str] = None
  prixAchat: Optional[Decimal] = None
  prixVente: Optional[Decimal] = None
  reductionMax: Optional[int] = None
  grossisteId: Optional[str] = None
  detailId: Optional[int] = None
  categorie: Optional[int] = None
  fournisseur: Optional[int] = None
  forme: Optional[int] = None
  fabriquant: Optional[int] = None
  rayon: Optional[int] = None
  etagere: Optional[str] = None
  magasin: Optional[int] = None

class ProduitRequestNewDto(BaseModel):
  id: Optional[int] = None
  ean13: Optional[str] = None
  codebarre: Optional[str] = None
  codeLaborex: Optional[str] = None
  codeUbipharm: Optional[str] = None
  reference: Optional[str] = None
  nom: Optional[str] = None
  stock: Optional[int] = 0
  stockMax: Optional[int] = 0
  stockMin: Optional[int] = 0
  contenuDetail: Optional[str] = None
  prixDetail: Optional[str] = None
  produitDetail: Optional[str] = None
  etat: Optional[str] = None
  reductionMax: Optional[int] = 0
  detailId: Optional[int] = None
  categorieId: Optional[int] = 0
  formeId: Optional[int] = 0
  fabriquantId: Optional[int] = 0
  rayonId: Optional[int] = 0
  etagere: Optional[str] = None
  magasinId: Optional[int] = 0

class StockDetailDto(BaseModel):
  enRayonId: Optional[int] = None
  productNom: Optional[str] = None
  depotNom: Optional[str] = None
  rayonNom: Optional[str] = None
  quantite: int
  datePeremption: Optional[datetime] = None
  numeroLot: Optional[str] = None

class ProduitResponseDto(BaseModel):
  id: Optional[int] = None
  nom: str
  description: Optional[str] = None
  codebarre: Optional[str] = None
  image: Optional[str] = None
  seuil: Optional[int] = None
  categorieNom: Optional[str] = None
  uniteMesure: Optional[str] = None
  tva: Optional[Decimal] = None
  prixAchatInitial: Optional[Decimal] = None
  margeBeneficiaire: Optional[Decimal] = None
  prixVenteConseille: Optional[Decimal] = None
  prixVenteActuel: Optional[Decimal] = None
  quantiteTotaleEnStock: Optional[int] = None
  dateCreation: Optional[datetime] = None
  dateModification: Optional[datetime] = None
  stockDetails: Optional[List[StockDetailDto]] = None

class ProduitResponseNewDto(BaseModel):
  nom: Optional[str] = None
  ean13: Optional[str] = None
  codeLaborex: Optional[str] = None
  codeUbipharm: Optional[str] = None
  reference: Optional[str] = None
  stock: Optional[int] = 0
  stockMax: Optional[int] = 0
  stockMin: Optional[int] = 0
  contenuDetail: Optional[str] = None
  prixDetail: Optional[str] = None
  etat: Optional[str] = None
  id: Optional[str] = None
  reductionMax: Optional[int] = 0
  detailId: Optional[str] = None
  categorieId: Optional[int] = 0
  formeId: Optional[int] = 0
  fabriquantId: Optional[int] = 0
  rayonId: Optional[int] = 0
  produitDetail: Optional[str] = None
  etagere: Optional[str] = None
  magasinId: Optional[int] = 0

class CategorieDto(BaseModel):
  id: Optional[int] = None
  nom: str

class FournisseurDto(BaseModel):
  id: Optional[int] = None
  nom: str
  email: Optional[str] = None
  telephone: Optional[str] = None

class DepotDto(BaseModel):
  id: Optional[int] = None
  nom: str
  adresse: Optional[str] = None

class RayonDto(BaseModel):
  id: Optional[int] = None
  nom: Optional[str] = None
  code: Optional[str] = None

class ProduitStockUpdateRequestDto(BaseModel):
  quantiteChange: int
  depotId: int
  rayonId: Optional[int] = None
  numeroLot: Optional[str] = None
  datePeremption: Optional[datetime] = None

class ProduitTarificationUpdateRequestDto(BaseModel):
  nouveauPrixVente: Decimal
  dateDebut: Optional[datetime] = None

class DataDto(BaseModel):
  nom: Optional[str] = None
  contenuDetail: Optional[str] = None
  produitId: Optional[int] = None

class ProduitDetailDto(BaseModel):
  nom: Optional[str] = None
  reference: Optional[str] = None
  stock: Optional[int] = 0
  stockMax: Optional[int] = 0
  stockMin: Optional[int] = 0
  prix: Optional[str] = None
  reductionMax: Optional[int] = 0
  magasinId: Optional[int] = None
  data: Optional[List[DataDto]] = None
