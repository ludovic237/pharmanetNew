from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CaisseOuvertureRequestDto(BaseModel):
  fondCaisseOuvert: float = Field(..., alias="fondCaisseOuvert")
  ouvertureCaisse: str = Field(..., alias="ouvertureCaisse")

  class Config:
    populate_by_name = True


class CaisseDto(BaseModel):
  id: Optional[int]
  employeId: Optional[int]
  nomEmploye: Optional[str]  # Pour affichage
  dateOuvert: Optional[datetime]
  dateFerme: Optional[datetime]
  session: Optional[str]
  fondCaisseOuvert: Optional[float]
  fondCaisseFerme: Optional[float]
  etat: Optional[str]


class CaisseClotureRequestDto(BaseModel):
  fondCaisseFerme: int
  fermetureCaisse: str


class CaisseFermetureRequestDto(BaseModel):
  fondCaisseFerme: float
  # Ajoutez d'autres champs si nécessaire pour la clôture
  # ex: totalVentesEspeces, totalDepenses
