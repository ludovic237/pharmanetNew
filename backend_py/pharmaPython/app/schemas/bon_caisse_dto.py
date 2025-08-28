from pydantic import BaseModel


class BonCaisseData(BaseModel):
  nom_client: str
  montant: float
