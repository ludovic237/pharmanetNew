# services/retour_produit_service.py
from sqlalchemy.orm import Session
from typing import Any, Dict
from fastapi import HTTPException

from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.produit_retour_repository import ProduitRetourRepository
from app.repositories.retour_produit_repository import RetourProduitRepository


class RetourProduitService:
  def __init__(self, db: Session):
    self.db = db
    self.retour_produit_repo = RetourProduitRepository(db)
    self.produit_retour_repo = ProduitRetourRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.produit_detail_repo = ProduitDetailRepository(db)
    self.enrayon_repo = EnRayonRepository(db)

  def lister_retour_produits_avec_details(self, page: int, size: int):
    rows, total = self.retour_produit_repo.find_all(page, size)
    content = []
    for r in rows:
      produits_retournes = self.produit_retour_repo.find_by_retour_id(r.id)
      quantite_total = sum(p.quantite or 0 for p in produits_retournes)
      quantite_prix = sum((p.quantite or 0) * (p.concerner.prixUnit or 0) for p in produits_retournes)
      employe = r.caisse.user.user if r.caisse and r.caisse.user else None
      produits = []
      for pr in produits_retournes:
        if pr.concerner.type == "detail":
          pd = self.produit_detail_repo.find_by_id(int(pr.concerner.enRayonId))
          produits.append({
            "produitId": pd.id, "nomProduit": pd.nom,
            "quantiteRetournee": pr.quantite,
            "prixUnit": pr.concerner.prixUnit
          })
        else:
          er = self.enrayon_repo.find_by_id(pr.concerner.enRayonId)
          p = self.produit_repo.find_by_id(er.produitId)
          produits.append({
            "produitId": p.id, "nomProduit": p.nom,
            "quantiteRetournee": pr.quantite,
            "prixUnit": pr.concerner.prixUnit
          })
      content.append({
        "idRetour": r.id,
        "caisseId": r.caisse.id if r.caisse else None,
        "caissier": f"{employe.nom} {employe.prenom}" if employe else None,
        "dateRetour": r.dateRetour,
        "nomEmploye": f"{r.employe.user.nom} {r.employe.user.prenom}" if r.employe else None,
        "venteReference": r.vente.reference if r.vente else None,
        "quantiteTotalRetour": quantite_total,
        "quantiteTotalRetourPrix": quantite_prix,
        "produitsRetournes": produits
      })
    return {"content": content, "totalElements": total}
