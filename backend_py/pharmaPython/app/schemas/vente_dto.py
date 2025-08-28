from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ProduitAssocieDto(BaseModel):
  produitId: Optional[int] = None
  quantite: Optional[int] = None
  rayonId: Optional[str] = None
  type: Optional[str] = None
  prixUnit: Optional[int] = None
  reduction: Optional[int] = None

class ClientInfo(BaseModel):
  id: Optional[int] = None
  type: Optional[str] = None
  name: Optional[str] = None
  phone: Optional[str] = None

class PrescripteurInfo(BaseModel):
  id: Optional[int] = None
  type: Optional[str] = None
  name: Optional[str] = None

class ElectroniqueRequestDto(BaseModel):
  numeroTelephone: str
  montant: int

class ElectroniqueDto(BaseModel):
  numeroTelephone: str
  montantElectronique: int

class TicketDto(BaseModel):
  numeroTicket: str
  montantTicket: int

class EncaissementRequestDto(BaseModel):
  typePaiement: str
  montantPercu: int
  reste: int
  montantTtc: int
  espece: Optional[int] = None
  electronique: Optional[ElectroniqueRequestDto] = None
  ticket: Optional[int] = None

class EncaissementDto(BaseModel):
  typeEncaissement: str
  venteId: int
  montantPercu: int
  montantRendu: int
  espece: Optional[int] = None
  electronique: Optional[ElectroniqueDto] = None
  ticket: Optional[TicketDto] = None

class VenteRequestDto(BaseModel):
  reduction: Optional[int] = None
  clientInfo: ClientInfo
  prescripteurInfo: PrescripteurInfo
  reductionEnabled: bool
  prixTotal: float
  prixReduction: float
  commentaire: str
  etat: str
  produits: List[ProduitAssocieDto]

class EncaissementDirectDto(BaseModel):
  encaissementDto: EncaissementDto
  venteRequestDto: VenteRequestDto

class VentePageableCustomlDto(BaseModel):
  # Page<Map<String, Any?>> → liste de dicts + méta
  content: List[Dict[str, Any]] = []
  totalElements: int
  totalPages: int
  pageSize: int
  pageNumber: int
  totalAmount: float
  data: Dict[str, Any]
