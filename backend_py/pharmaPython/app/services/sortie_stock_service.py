# services/sortie_stock_service.py
from sqlalchemy.orm import Session
from datetime import datetime

from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.sortie_stock_repository import SortieStockRepository
from app.repositories.type_sortie_repository import TypeSortieRepository


class SortieStockService:
  def __init__(self, db: Session):
    self.db = db
    self.produit_detail_repo = ProduitDetailRepository(db)
    self.sortie_stock_repo = SortieStockRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.type_sortie_repo = TypeSortieRepository(db)
    self.produit_repo = ProduitRepository(db)

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
