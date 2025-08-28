from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class CaisseOuvertureRequestDto(BaseModel):
  fondCaisseOuvert: Decimal
  ouvertureCaisse: str


class CaisseDto(BaseModel):
  id: Optional[int]
  employeId: Optional[int]
  employeNom: Optional[str]  # Pour affichage
  dateOuvert: Optional[datetime]
  dateFerme: Optional[datetime]
  session: Optional[str]
  fondCaisseOuvert: Optional[Decimal]
  fondCaisseFerme: Optional[Decimal]
  etat: Optional[str]


class CaisseClotureRequestDto(BaseModel):
  fondCaisseFerme: int
  fermetureCaisse: str


class CaisseFermetureRequestDto(BaseModel):
  fondCaisseFerme: Decimal
  # Ajoutez d'autres champs si nécessaire pour la clôture
  # ex: totalVentesEspeces, totalDepenses
