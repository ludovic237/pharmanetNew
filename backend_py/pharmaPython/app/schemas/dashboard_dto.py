# schemas/dashboard.py
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List, Protocol, runtime_checkable
from datetime import datetime, date

# ---- DTOs ----

class SessionsDto(BaseModel):
  ouvertes: int
  cloturees: int


class AlertsDto(BaseModel):
  ruptures: int
  perimes30j: int


class KpiDto(BaseModel):
  ca: float
  encaisse: float
  tickets: int
  tauxRetour: float
  depenses: float
  sessions: SessionsDto
  alerts: AlertsDto
  caSeries: List[float] = []


class SalesMonthlyPoint(BaseModel):
  mois: str          # "YYYY-MM"
  total: float


class CategorySales(BaseModel):
  categorie: str
  total: float


class TopProduct(BaseModel):
  nom: str
  qty: int


class OrderRow(BaseModel):
  id: int
  ref: Optional[str] = None
  fournisseur: Optional[str] = None
  montantCmd: Optional[float] = None
  montantRecu: Optional[float] = None
  etat: Optional[str] = None
  dateCreation: Optional[datetime] = None
  dateLivraison: Optional[datetime] = None


class StockAlertRow(BaseModel):
  produit: str
  quantiteRestante: Optional[int] = None
  datePeremption: Optional[date] = None


# ---- Interfaces Kotlin → Protocols Python (facultatif)
# Utile si vous mappez des lignes SQL/ORM directement sans Pydantic.

@runtime_checkable
class CategorySalesRow(Protocol):
  def getCategorie(self) -> Optional[str]: ...
  def getTotal(self) -> float: ...


@runtime_checkable
class TopProductRow(Protocol):
  def getNom(self) -> str: ...
  def getQty(self) -> int: ...


@runtime_checkable
class OrderRowView(Protocol):
  def getId(self) -> int: ...
  def getRef(self) -> Optional[str]: ...
  def getFournisseur(self) -> Optional[str]: ...
  def getMontantCmd(self) -> Optional[float]: ...
  def getMontantRecu(self) -> Optional[float]: ...
  def getEtat(self) -> Optional[str]: ...
  def getDateCreation(self) -> Optional[datetime]: ...
  def getDateLivraison(self) -> Optional[datetime]: ...


@runtime_checkable
class StockAlertRowView(Protocol):
  def getProduit(self) -> str: ...
  def getQuantiteRestante(self) -> Optional[int]: ...
  def getDatePeremption(self) -> Optional[date]: ...
