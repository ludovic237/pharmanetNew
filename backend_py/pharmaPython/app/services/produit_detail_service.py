# services/produit_detail_service.py
from __future__ import annotations
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException

# Exemple : from schemas.produit_detail_dto import ProduitDetailDto
# Adapte les imports ci-dessus à tes propres DTO Pydantic.


def _page_meta(total: int, page: int, size: int) -> Dict[str, int]:
  pages = (total + size - 1) // size if size else 1
  return {"totalElements": total, "totalPages": pages, "pageSize": size, "pageNumber": page}


class ProduitDetailService:
  """
  Port Python de ProduitDetailService.kt.
  Les repositories Spring sont remplacés par des DAO/Repositories SQLAlchemy injectés.
  """

  def __init__(
    self,
    db: Session,
    *,
    user_utils,
    produit_detail_repo,
    retour_produit_repo,
    produit_retour_repo,
    produit_cmd_repo,
    employe_repo,
    concerner_repo,
    vente_repo,
    produit_repo,
    categorie_repo,
    fournisseur_repo,
    rayon_repo,
    enrayon_repo,
    forme_repo,
    magasin_repo,
    fabriquant_repo,
    caisse_repo,
  ):
    self.db = db
    self.user_utils = user_utils
    self.produit_detail_repo = produit_detail_repo
    self.retour_produit_repo = retour_produit_repo
    self.produit_retour_repo = produit_retour_repo
    self.produit_cmd_repo = produit_cmd_repo
    self.employe_repo = employe_repo
    self.concerner_repo = concerner_repo
    self.vente_repo = vente_repo
    self.produit_repo = produit_repo
    self.categorie_repo = categorie_repo
    self.fournisseur_repo = fournisseur_repo
    self.rayon_repo = rayon_repo
    self.enrayon_repo = enrayon_repo
    self.forme_repo = forme_repo
    self.magasin_repo = magasin_repo
    self.fabriquant_repo = fabriquant_repo
    self.caisse_repo = caisse_repo

  # ---------------------------------------------------------------------
  # getProduitDetailsByName(nom): List<Map<String,Any?>>
  # ---------------------------------------------------------------------
  def get_produit_details_by_name(self, nom: str) -> List[Dict[str, Any]]:
    if not (nom or "").strip():
      return []

    # Kotlin: findByNomContainingIgnoreCaseAndSupprimerIs(nom, 0)
    rows = self.produit_detail_repo.find_by_nom_contains_and_supprimer(nom, 0)
    out: List[Dict[str, Any]] = []
    for pd in rows:
      out.append({
        "id": pd.id,
        "nom": pd.nom,
        "reference": pd.reference,
        "stock": pd.stock,
        "prix": pd.prix,
        "grossisteList": pd.grossisteList,
        "stockMin": pd.stockMin,
        "stockMax": pd.stockMax,
      })
    return out

  # ---------------------------------------------------------------------
  # getProduitDetailsByNamePageable(nom, pageable): Page<Map<...>>
  # ---------------------------------------------------------------------
  def get_produit_details_by_name_pageable(self, nom: Optional[str], page: int, size: int) -> Dict[str, Any]:
    if nom is None or not nom.strip():
      # Kotlin retourne Page.empty(pageable) → ici, page vide
      return {"content": [], **_page_meta(0, page, size)}

    # Kotlin: findByNomContainingIgnoreCaseAndSupprimer(nom, 0, pageable)
    rows, total = self.produit_detail_repo.find_by_nom_contains_and_supprimer_pageable(nom, 0, page, size)

    def _map_row(pd) -> Dict[str, Any]:
      # Kotlin : produitRepository.findByDetailId(pd.id)
      produits = self.produit_repo.find_by_detail_id(pd.id) if pd.id is not None else []
      produit_grossiste = [{"nom": p.nom, "stock": p.stock} for p in produits]
      return {
        "id": pd.id,
        "nom": pd.nom,
        "reference": pd.reference,
        "stock": pd.stock,
        "prix": pd.prix,
        "reductionMax": pd.reductionMax,
        "grossisteList": produit_grossiste,
        "stockMin": pd.stockMin,
        "stockMax": pd.stockMax,
      }

    content = [_map_row(pd) for pd in rows]
    return {"content": content, **_page_meta(total, page, size)}

  # ---------------------------------------------------------------------
  # getProduitDetailsPageable(pageable): Page<Map<...>>
  # ---------------------------------------------------------------------
  def get_produit_details_pageable(self, page: int, size: int) -> Dict[str, Any]:
    # Kotlin: ProduitDetailRepository.filterProduitDetail(0) + findAll(spec,pageable)
    rows, total = self.produit_detail_repo.find_all_filtered_supprimer(0, page, size)

    def _map_row(pd) -> Dict[str, Any]:
      produits = self.produit_repo.find_by_detail_id(pd.id) if pd.id is not None else []
      produit_grossiste = [{"nom": p.nom, "stock": p.stock} for p in produits]
      return {
        "id": pd.id,
        "nom": pd.nom,
        "reference": pd.reference,
        "stock": pd.stock,
        "prix": pd.prix,
        "reductionMax": pd.reductionMax,
        "grossisteList": produit_grossiste,
        "stockMin": pd.stockMin,
        "stockMax": pd.stockMax,
      }

    content = [_map_row(pd) for pd in rows]
    return {"content": content, **_page_meta(total, page, size)}

  # ---------------------------------------------------------------------
  # createProduitDetail(produitDto): ProduitDetail
  # ---------------------------------------------------------------------
  def create_produit_detail(self, produit_dto) -> Any:
    if produit_dto is None:
      raise HTTPException(status_code=400, detail="Le corps de la requête est vide.")

    pd = self.produit_detail_repo.model()
    pd.nom = produit_dto.nom
    pd.reference = produit_dto.reference
    pd.stock = produit_dto.stock
    pd.stockMax = produit_dto.stockMax
    pd.stockMin = produit_dto.stockMin
    pd.prix = int(produit_dto.prix or 0)
    pd.reductionMax = produit_dto.reductionMax
    # Kotlin stocke magasinId.toString() dans grossisteList
    pd.grossisteList = str(produit_dto.magasinId) if getattr(produit_dto, "magasinId", None) is not None else None

    pd = self.produit_detail_repo.save(pd)

    # Lier chaque produit "grossiste" au produitDetail créé
    for item in (produit_dto.data or []):
      p = self.produit_repo.find_by_id(int(item.produitId))
      if not p:
        raise HTTPException(404, detail=f"Produit introuvable: {item.produitId}")
      p.detailId = pd.id
      p.contenuDetail = str(produit_dto.stock) if produit_dto.stock is not None else None
      self.produit_repo.save(p)

    return pd

  # ---------------------------------------------------------------------
  # getProduitDetailsInfo(produitDetailId): Map<String,Any?>
  # ---------------------------------------------------------------------
  def get_produit_details_info(self, produit_detail_id: str) -> Dict[str, Any]:
    pd = self.produit_detail_repo.find_by_id(int(produit_detail_id))
    if not pd:
      raise HTTPException(status_code=404, detail="ProduitDetail introuvable")

    produits = self.produit_repo.find_by_detail_id(pd.id) if pd.id is not None else []
    produit_grossiste = [{
      "id": p.id,
      "nom": p.nom,
      "stock": p.stock,
      "contenuDetail": p.contenuDetail,
    } for p in produits]

    return {
      "id": pd.id,
      "nom": pd.nom,
      "reference": pd.reference,
      "stock": pd.stock,
      "prix": pd.prix,
      "reductionMax": pd.reductionMax,
      "grossisteList": produit_grossiste,
      "stockMin": pd.stockMin,
      "stockMax": pd.stockMax,
    }

  # ---------------------------------------------------------------------
  # removeParentDetail(productId, productDetailId): Produit
  # ---------------------------------------------------------------------
  def remove_parent_detail(self, product_id: str, product_detail_id: str) -> Any:
    p = self.produit_repo.find_by_id_and_detail_id(int(product_id), int(product_detail_id))
    if not p:
      raise HTTPException(status_code=404, detail="Produit introuvable ou non rattaché à ce ProduitDetail.")
    p.detailId = None
    p.contenuDetail = None
    return self.produit_repo.save(p)

  # ---------------------------------------------------------------------
  # removeProduitDetail(productDetailId): ProduitDetail
  # (désactivation logique + retrait du lien côté produits)
  # ---------------------------------------------------------------------
  def remove_produit_detail(self, product_detail_id: str) -> Any:
    pd = self.produit_detail_repo.find_by_id(int(product_detail_id))
    if not pd:
      raise HTTPException(status_code=404, detail="ProduitDetail introuvable")

    pd.supprimer = 1
    pd = self.produit_detail_repo.save(pd)

    for p in self.produit_repo.find_by_detail_id(int(product_detail_id)):
      p.detailId = None
      self.produit_repo.save(p)

    return pd

  # ---------------------------------------------------------------------
  # updateProduitDetail(produitDetailId, produitDto): ProduitDetail
  # ---------------------------------------------------------------------
  def update_produit_detail(self, produit_detail_id: str, produit_dto) -> Any:
    pd = self.produit_detail_repo.find_by_id(int(produit_detail_id))
    if not pd:
      raise HTTPException(status_code=404, detail="ProduitDetail introuvable")

    pd.nom = produit_dto.nom
    pd.reference = produit_dto.reference
    pd.stock = produit_dto.stock
    pd.stockMax = produit_dto.stockMax
    pd.stockMin = produit_dto.stockMin
    pd.prix = int(produit_dto.prix or 0)
    pd.reductionMax = produit_dto.reductionMax
    pd.grossisteList = str(produit_dto.magasinId) if getattr(produit_dto, "magasinId", None) is not None else None

    pd = self.produit_detail_repo.save(pd)

    # (Ré)attacher les produits listés
    for item in (produit_dto.data or []):
      p = self.produit_repo.find_by_id(int(item.produitId))
      if not p:
        raise HTTPException(404, detail=f"Produit introuvable: {item.produitId}")
      p.detailId = pd.id
      p.contenuDetail = str(produit_dto.stock) if produit_dto.stock is not None else None
      self.produit_repo.save(p)

    return pd
