# services/sortie_stock_service.py
from sqlalchemy.orm import Session
from datetime import datetime

class SortieStockService:
  def __init__(self, db: Session,
               produit_detail_repo,
               sortie_stock_repo,
               enrayon_repo,
               type_sortie_repo,
               produit_repo):
    self.db = db
    self.produit_detail_repo = produit_detail_repo
    self.sortie_stock_repo = sortie_stock_repo
    self.enrayon_repo = enrayon_repo
    self.type_sortie_repo = type_sortie_repo
    self.produit_repo = produit_repo

  def get_sortie_stock_pageable(self, nomProduit, typeSortie, enRayonId, produitDetailId, page, size):
    rows, total = self.sortie_stock_repo.filter_sortie_stock(
      nomProduit, typeSortie, enRayonId, produitDetailId, page, size
    )
    content = []
    for s in rows:
      enrayon = self.enrayon_repo.find_by_id(s.enRayon.id)
      produit = self.produit_repo.find_by_id(enrayon.produitId)
      produit_detail = None
      if s.detailId:
        produit_detail = self.produit_detail_repo.find_by_id(int(s.detailId))
      nom, idp = produit.nom, produit.id
      if s.typeSortie.nom == "detail":
        pd = self.produit_detail_repo.find_by_id(s.enRayon.id)
        nom, idp = pd.nom, pd.id
      content.append({
        "id": s.id, "nomProduit": nom,
        "typeSortie": s.typeSortie.nom,
        "enRayonId": s.enRayon.id,
        "produitDetailId": s.detailId,
        "produitDetailNom": produit_detail.nom if produit_detail else None,
        "produitDetailPrix": produit_detail.prix if produit_detail else None,
        "quantite": s.quantite,
        "dateSortie": s.dateSortie,
      })
    return {"content": content, "totalElements": total}
