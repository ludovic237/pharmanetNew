from typing import Any, List, Dict

from sqlalchemy.orm import Session
from datetime import datetime

from app.models.bon_caisse import BonCaisse
from app.repositories.bon_caisse_repository import BonCaisseRepository
from app.schemas.bon_caisse_dto import BonCaisseData
from app.services.caisse_service import CaisseService


class BonCaisseService:
  def __init__(self, db: Session):
    self.db = db
    self.caisse_service = CaisseService
    self.bon_caisse_repository = BonCaisseRepository(db)

  def get_all_bons(self) -> list[dict[str, Any]]:
    rows = self.bon_caisse_repository.find_all()
    mapped: List[Dict[str, Any]] = []
    for d in rows:
      mapped.append({
        "id": getattr(d,"id",None),
        "codebarreId": getattr(d,"codebarre_id",None),
        "montant": getattr(d,"montant",None),
        "nomClient": getattr(d,"nom_client",None),
        "statut": getattr(d,"statut",None),
        "validite": getattr(d,"validite",None),
        "type": getattr(d,"type",None),
        "dateGenerer": getattr(d,"date_generer",None),
        "dateEncaisser": getattr(d,"date_encaisser",None) or "0000-00-00T00:00:00",
        "caisseIdEncaisser": getattr(d,"caisse_id_encaisser",None),
        "supprimer": getattr(d,"supprimer",None)
      })
    return mapped

  def get_bon_by_id(self, bon_id: int) -> BonCaisse:
    return self.bon_caisse_repository.find_by_id(self.db, bon_id)

  def get_bon_by_codebarre_id(self, codebarre_id: str) -> BonCaisse | None:
    return self.bon_caisse_repository.find_by_codebarre_id(self.db, codebarre_id=codebarre_id)

  def create_bon(self, bon_data: BonCaisseData) -> BonCaisse:
    date_code = datetime.now().strftime("%y%m%d%H%M%S")
    caisse = self.caisse_service.get_caisse_active_db(self.db)

    bon = BonCaisse(
      nom_client=bon_data.nom_client,
      montant=bon_data.montant,
      codebarre_id=date_code,
      date_generer=datetime.now(),
      type="Générer",
      supprimer=0,
      caisse=caisse
    )
    return self.bon_caisse_repository.save(self.db, bon)

  def update_bon(self, codebarre_id: str) -> BonCaisse:
    existing_bon = self.bon_caisse_repository.find_by_codebarre_id(self.db, codebarre_id)

    if existing_bon is None:
      raise ValueError("Bon not found")
    if existing_bon.type == "Encaisser":
      raise ValueError("Bon already Encaisser")

    existing_bon.type = "Encaisser"
    existing_bon.date_encaisser = datetime.now()
    existing_bon.caisse_id_encaisser = self.caisse_service.get_caisse_active_db(self.db).id

    return self.bon_caisse_repository.save(self.db, existing_bon)

  def delete_bon(self, bon_id: int):
    bon = self.bon_caisse_repository.find_by_id(self.db, bon_id)
    bon.supprimer = 1
    self.bon_caisse_repository.save(self.db, bon)
