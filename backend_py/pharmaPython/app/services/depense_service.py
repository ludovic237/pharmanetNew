# services/depense_service.py
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.depense import Depense
from app.repositories.depense_repository import DepenseRepository
from app.services.caisse_service import CaisseService


def _parse_iso_to_naive_dt(value: Optional[str]) -> Optional[datetime]:
  """
  Kotlin utilise OffsetDateTime.parse(...).toLocalDateTime().
  Ici on parse ISO 8601 et on retourne un datetime *naïf* (sans TZ), équivalent à toLocalDateTime().
  """
  if not value:
    return None
  try:
    dt = datetime.fromisoformat(value.strip())
  except Exception as e:
    raise HTTPException(status_code=422, detail=f"Format datetime invalide: {value}") from e
  # Si 'dt' est aware, on drop la TZ pour mimer .toLocalDateTime()
  return dt.replace(tzinfo=None)


class DepenseService:
  """
  Traduction de:
    - getAllDepenses()
    - getAllDepensesPageabel(pageable)
    - createDepense(designation, prixUnitaire)
    - createDepenseMap(data)
    - updateDepense(id, designation, prixUnitaire)
    - deleteDepense(id)
  """

  def __init__(self, db: Session, caisse_service=None):
    self.db = db
    self.depense_repo = DepenseRepository(db)  # optionnel: pour get_caisse_active()
    self.caisse_service = CaisseService

  # ---------------------------
  # Récupération simple
  # ---------------------------
  def get_all_depenses(self) -> List[Depense]:
    return self.db.query(Depense).all()

  # ---------------------------
  # Récupération paginée "mappée"
  # (équivalent Page<Map<String, Any?>> côté Kotlin)
  # ---------------------------
  def get_all_depenses_pageable(self, page: int = 0, size: int = 10, sort: str = "dateDepense",
                                direction: str = "desc") -> [Dict[str, Any]]:
    rows, total = self.depense_repo.find_all_pageable(page=page, size=size, sort=sort, direction=direction)
    mapped: List[Dict[str, Any]] = []
    for d in rows:
      mapped.append({
        "id": getattr(d, "id", None),
        "caisseId": getattr(d, "caisse_id", None),
        "designation": getattr(d, "designation", None),
        "quantite": getattr(d, "quantite", None),
        "prixUnitaire": getattr(d, "prix_unitaire", None),
        "dateDepense": getattr(d, "date_depense", None),
        "beneficiaire": getattr(d, "beneficiaire", None),
        "numeroCni": getattr(d, "numero_cni", None),
        "dateDelivrance": getattr(d, "date_delivrance", None),
        "lieuDelivrance": getattr(d, "lieu_delivrance", None),
        "societe": getattr(d, "societe", None),
        "typeDepense": getattr(d, "type_depense", None),
        "supprimer": getattr(d, "supprimer", None),
      })
    # return mapped
    return {
      "content": mapped,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
      # "sortBy": sort,
      # "sortDir": direction.upper(),
    }

  # ---------------------------
  # Création simple (designation + prixUnitaire)
  # ---------------------------
  def create_depense(self, designation: str, prix_unitaire: int) -> Depense:
    if not self.caisse_service:
      raise HTTPException(status_code=500, detail="CaisseService non injecté")
    caisse = self.caisse_service.get_caisse_active_db(self.db)
    if not caisse:
      raise HTTPException(status_code=400, detail="Aucune caisse active")

    dep = Depense(
      caisse_id=str(getattr(caisse, "id", None)),
      designation=designation,
      prix_unitaire=prix_unitaire,
      date_depense=datetime.now(),
    )
    self.db.add(dep)
    self.db.commit()
    self.db.refresh(dep)
    return dep

  # ---------------------------
  # Création à partir d'une "map" (dict)
  # ---------------------------
  def create_depense_map(self, db: Session, data: Dict[str, Any]) -> Depense:
    caisseService = CaisseService(db)
    if not caisseService:
      raise HTTPException(status_code=500, detail="CaisseService non injecté")
    caisse = self.caisse_service.get_caisse_active_db(self.db)
    caisse_id = str(getattr(caisse, "id", "")) if caisse else None

    designation = data.get("designation")
    quantite = data.get("quantite")
    date_depense = _parse_iso_to_naive_dt(data.get("dateDepense"))
    beneficiaire = data.get("beneficiaire")
    numero_cni = data.get("numeroCni")
    date_delivrance = _parse_iso_to_naive_dt(data.get("dateDelivrance"))
    lieu_delivrance = data.get("lieuDelivrance")
    societe = data.get("societe")
    type_depense = data.get("typeDepense")  # laissé optionnel comme dans le code Kotlin (commenté)
    prix_unitaire = data.get("prixUnitaire")

    dep = Depense(
      caisse_id=caisse_id,
      designation=designation,
      quantite=quantite,
      date_depense=date_depense,
      beneficiaire=beneficiaire,
      numero_cni=numero_cni,
      date_delivrance=date_delivrance,
      lieu_delivrance=lieu_delivrance,
      societe=societe,
      type_depense=type_depense,
      prix_unitaire=prix_unitaire,
    )
    self.db.add(dep)
    self.db.commit()
    self.db.refresh(dep)
    return dep

  # ---------------------------
  # Mise à jour simple
  # ---------------------------
  def update_depense(self, depense_id: int, designation: str, prix_unitaire: int) -> Depense:
    dep: Optional[Depense] = self.db.query(Depense).filter(Depense.id == depense_id).first()
    if not dep:
      raise HTTPException(status_code=404, detail=f"Depense {depense_id} non trouvée")

    dep.designation = designation
    dep.prix_unitaire = prix_unitaire
    self.db.commit()
    self.db.refresh(dep)
    return dep

  # ---------------------------
  # Suppression
  # ---------------------------
  def delete_depense(self, depense_id: int) -> None:
    dep: Optional[Depense] = self.db.query(Depense).filter(Depense.id == depense_id).first()
    if not dep:
      raise HTTPException(status_code=404, detail=f"Depense {depense_id} non trouvée")

    # Suppression physique comme dans le Kotlin (depenseRepository.delete)
    # Si tu veux une suppression logique, remplace par: dep.supprimer = 1 ; commit
    self.db.delete(dep)
    self.db.commit()
