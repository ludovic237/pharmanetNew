# services/enrayon_service.py
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.en_rayon import EnRayon
from app.models.rayon import Rayon
from app.models.sortie_stock import SortieStock
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.forme_repository import FormeRepository
from app.repositories.fournisseur_repository import FournisseurRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.rayon_repository import RayonRepository
from app.repositories.sortie_stock_repository import SortieStockRepository
from app.repositories.type_sortie_repository import TypeSortieRepository
from app.schemas.enrayon_dto import ProduitEnRayonDto, EnRayonDto, EnRayonPageableCustomDto


# Modèles ORM attendus (à adapter à ton schéma SQLAlchemy)
# - EnRayon: id (str), produit_id (int), fournisseur, commande, date_livraison, date_peremption,
#            prix_achat, prix_vente, reduction, quantite, quantite_restante, supprimer
# - SortieStock: en_rayon(FK), quantite, detail_id(str), type_sortie(FK), date_sortie
# - Produit: id, detail_id, stock, contenu_detail, ean13, nom, etat, reduction_max, rayon, etagere, magasin, ...
# - ProduitDetail: id, stock, prix, nom, reference, reduction_max, grossiste_list (str avec "-")
# - Rayon: id, nom


def _parse_iso_dt(s: Optional[str]) -> Optional[datetime]:
  if not s:
    return None
  try:
    return datetime.fromisoformat(s.strip())
  except Exception:
    raise HTTPException(status_code=422, detail=f"DateTime invalide (ISO attendu): {s}")


class EnRayonService:
  def __init__(
    self,
    db: Session
  ):
    self.db = db
    self.forme_repo = FormeRepository(db)
    self.sortie_stock_repo = SortieStockRepository(db)
    self.type_sortie_repo = TypeSortieRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.fournisseur_repo = FournisseurRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.rayon_repo = RayonRepository(db)
    self.produit_detail_repo = ProduitDetailRepository(db)

  # ---------------------------------------------------------------------
  # decrementerStock(enRayonId, produitDetailId)
  # ---------------------------------------------------------------------
  def decrementer_stock(self, en_rayon_id: int, produit_detail_id: int) -> Dict[str, Any]:
    en_rayon = self.enrayon_repo.find_by_id(str(en_rayon_id))
    if not en_rayon:
      return {"messsage": f"Produit EnRayon introuvable avec l'ID: {en_rayon_id}"}

    produit = self.produit_repo.find_by_id(en_rayon.produit_id or 0)
    if not produit:
      return {"messsage": f"Produit introuvable avec l'ID: {en_rayon.produit_id}"}

    produit_detail = self.produit_detail_repo.find_by_id(produit_detail_id)
    if not produit_detail:
      return {"messsage": f"Produit Detail introuvable avec l'ID: {produit_detail_id}"}

    if (en_rayon.quantite or 0) > 0 and (produit.detail_id == produit_detail_id):
      sortie = SortieStock(
        en_rayon=en_rayon,
        quantite=1,
        detail_id=str(produit_detail_id),
        type_sortie=self.type_sortie_repo.find_by_id(1),
        date_sortie=datetime.now(),
      )
      self.sortie_stock_repo.save(sortie)

      en_rayon.quantite_restante = (en_rayon.quantite_restante or 0) - 1
      self.enrayon_repo.save(en_rayon)

      produit.stock = (produit.stock or 0) - 1
      self.produit_repo.save(produit)

      # On crédite le stock de ProduitDetail du "contenu_detail" du produit
      increment = int(produit.contenu_detail or 0)
      produit_detail.stock = (produit_detail.stock or 0) + increment
      self.produit_detail_repo.save(produit_detail)

      return {"messsage": "Succès : stock décrémenté et sortie enregistrée"}
    else:
      return {"messsage": "Erreur : quantité totale <= 0 ou mauvais produit/detail"}

  # ---------------------------------------------------------------------
  # ajouterProduitsEnRayon(produits)
  # ---------------------------------------------------------------------
  def ajouter_produits_en_rayon(self, produits: List[ProduitEnRayonDto]) -> List[EnRayon]:
    out: List[EnRayon] = []
    for dto in produits:
      produit = self.produit_repo.find_by_id(int(dto.produitId))
      if not produit:
        raise HTTPException(status_code=404, detail=f"Produit introuvable: {dto.produitId}")

      fournisseur = self.fournisseur_repo.find_by_id(int(dto.fournisseurId))
      if not fournisseur:
        raise HTTPException(status_code=404, detail=f"Fournisseur introuvable: {dto.fournisseurId}")

      rayon = self.rayon_repo.find_by_id(int(dto.rayonId))
      if not rayon:
        raise HTTPException(status_code=404, detail=f"Rayon introuvable: {dto.rayonId}")

      # id = produit.id + fournisseur.code + horodatage (yyyyMMddHHmmss)
      formatted_now = datetime.now().strftime("%Y%m%d%H%M%S")
      en_rayon = EnRayon(
        id=f"{produit.id}{fournisseur.code}{formatted_now}",
        produit_id=produit.id,
        fournisseur=fournisseur,
        quantite=dto.quantite,
        prix_achat=dto.prixAchat,
        prix_vente=dto.prixVente,
        quantite_restante=dto.quantiteRestante,
        date_peremption=dto.datePeremption,
        date_livraison=dto.dateLivraison,
        supprimer=0,
      )
      self.enrayon_repo.save(en_rayon)
      out.append(en_rayon)
    return out

  # ---------------------------------------------------------------------
  # mettreAJourProduitsEnRayon(produits)
  # ---------------------------------------------------------------------
  def mettre_a_jour_produits_en_rayon(self, produits: List[ProduitEnRayonDto]) -> List[EnRayon]:
    out: List[EnRayon] = []
    for dto in produits:
      en_rayon = self.enrayon_repo.find_by_id(str(dto.enRayonId))
      if not en_rayon:
        raise HTTPException(status_code=404, detail=f"Produit en rayon introuvable: {dto.enRayonId}")
      en_rayon.quantite = dto.quantite
      en_rayon.date_peremption = dto.datePeremption
      self.enrayon_repo.save(en_rayon)
      out.append(en_rayon)
    return out

  # ---------------------------------------------------------------------
  # getProduitsEnRayonParProduitIdt(produitId)
  # ---------------------------------------------------------------------
  def get_produits_par_produit(self, produit_id: int) -> List[Dict[str, Any]]:
    data: List[Dict[str, Any]] = []
    if produit_id < 700:
      # Côté détail
      p = self.produit_detail_repo.find_by_id_and_stock_greater_than_and_supprimer(produit_id)
      # p = self.produit_detail_repo.find_by_id_stock_gt_and_supprimer(produit_id)
      if not p:
        return []
      grossistes = []
      if getattr(p, "grossiste_list", None):
        for g in p.grossiste_list.split("-"):
          grossistes.append(self.produit_repo.find_by_id(int(g)))

      data.append({
        "id": p.id,
        "nom": p.nom,
        "reference": p.reference,
        "quantiteRestante": p.stock,
        "quantite": p.stock,
        "prixVente": p.prix,
        "dateLivraison": "",
        "datePeremption": "",
        "grossistes": grossistes,
        "reductionMax": p.reduction_max,
        "reduction": p.reduction_max,
        "type": "detail",
      })
      return data
    else:
      produit = self.produit_repo.find_by_id(produit_id)
      if not produit:
        return []
      enrayons = self.enrayon_repo.find_by_produit_id_and_quantite_restante_gt_and_supprimer(produit.id)
      for er in enrayons:
        p = self.produit_repo.find_by_id(er.produit_id or 0)
        data.append({
          "id": getattr(p, "id", None),
          "rayonId": er.id,
          "quantite": er.quantite,
          "quantiteRestante": er.quantite_restante,
          "dateLivraison": er.date_livraison,
          "datePeremption": er.date_peremption,
          "ean13": getattr(p, "ean13", None),
          "nom": getattr(p, "nom", None),
          "stock": getattr(p, "stock", None),
          "prixVente": er.prix_vente,
          "etat": getattr(p, "etat", None),
          "reductionMax": getattr(p, "reduction_max", 0),
          "reduction": getattr(p, "reduction_max", 0),
          "rayon": {"id": getattr(getattr(p, "rayon", None), "id", None)},
          "etagere": getattr(p, "etagere", None),
          "type": "produit",
        })
      return data

  # ---------------------------------------------------------------------
  # getProduitsWithDetailEnRayonParProduitIdt(produitId, produitType)
  # ---------------------------------------------------------------------
  def get_produits_with_detail_par_produit(self, produit_id: int, produit_type: str) -> List[Dict[str, Any]]:
    enrayons = self.enrayon_repo.find_by_produit_id_and_supprimer(
      self.produit_repo.find_by_id(produit_id).id, 0
    )
    result: List[Dict[str, Any]] = []
    for er in enrayons:
      prod = self.produit_repo.find_by_id(int(er.produit_id or 0))
      min_reduction = min(int(getattr(prod, "reduction_max", 0) or 0), int(er.reduction or 0))
      result.append({
        "id": er.id,
        "produit": {
          "id": getattr(prod, "id", None),
          "ean13": getattr(prod, "ean13", None),
          "nom": getattr(prod, "nom", None),
          "stock": getattr(prod, "stock", None),
          "etat": getattr(prod, "etat", None),
          "reductionMax": getattr(prod, "reduction_max", 0),
          "categorie": {
            "id": getattr(getattr(prod, "categorie", None), "id", None),
            "nom": getattr(getattr(prod, "categorie", None), "nom", None),
          },
          "forme": {
            "id": getattr(getattr(prod, "forme", None), "id", None),
            "code": getattr(getattr(prod, "forme", None), "code", None),
            "nom": getattr(getattr(prod, "forme", None), "nom", None),
          },
          "fabriquant": {
            "id": getattr(getattr(prod, "fabriquant", None), "id", None),
            "code": getattr(getattr(prod, "fabriquant", None), "code", None),
            "nom": getattr(getattr(prod, "fabriquant", None), "nom", None),
          },
          "rayon": {"id": getattr(getattr(prod, "rayon", None), "id", None)},
          "etagere": getattr(prod, "etagere", None),
          "magasin": {
            "id": getattr(getattr(prod, "magasin", None), "id", None),
            "code": getattr(getattr(prod, "magasin", None), "code", None),
            "nom": getattr(getattr(prod, "magasin", None), "nom", None),
          },
        },
        "rayon": {"id": er.id},
        "fournisseur": {
          "id": getattr(getattr(er, "fournisseur", None), "id", None),
          "code": getattr(getattr(er, "fournisseur", None), "code", None),
          "nom": getattr(getattr(er, "fournisseur", None), "nom", None),
          "statut": getattr(getattr(er, "fournisseur", None), "statut", None),
          "supprimer": getattr(getattr(er, "fournisseur", None), "supprimer", None),
        },
        "commande": {"id": getattr(getattr(er, "commande", None), "id", None)} if getattr(er, "commande",
                                                                                          None) else None,
        "dateLivraison": er.date_livraison,
        "datePeremption": er.date_peremption,
        "prixAchat": er.prix_achat,
        "prixVente": er.prix_vente,
        "reduction": min_reduction,
        "quantite": er.quantite,
        "quantiteRestante": er.quantite_restante,
      })
    return result

  # ---------------------------------------------------------------------
  # Recherches simples
  # ---------------------------------------------------------------------
  def get_produits_par_nom_produit(self, nom: str) -> List[EnRayon]:
    produits = self.produit_repo.find_by_nom_containing(nom)
    ids = [p.id for p in produits if p and p.id is not None]
    return self.enrayon_repo.find_by_produit_id_in_and_supprimer(ids, 0)

  def get_produits_par_nom_rayon(self, nom_rayon: str) -> List[Rayon]:
    return self.rayon_repo.find_by_nom_containing_ignore_case(nom_rayon) or []

  def get_produits_par_fournisseur(self, nom_fournisseur: str) -> List[EnRayon]:
    return self.enrayon_repo.find_by_fournisseur_nom_containing_ignore_case_and_supprimer(nom_fournisseur, 0)

  def get_produits_par_commande(self, commande_id: int) -> List[EnRayon]:
    return self.enrayon_repo.find_by_commande_id_and_supprimer(commande_id, 0)

  def get_produits_par_intervalle_livraison(self, start: datetime, end: datetime) -> List[EnRayon]:
    return self.enrayon_repo.find_by_date_livraison_between_and_supprimer(start, end, 0)

  def get_produits_par_intervalle_peremption(self, start: datetime, end: datetime) -> List[EnRayon]:
    return self.enrayon_repo.find_by_date_peremption_between_and_supprimer(start, end, 0)

  def get_produits_par_intervalle_prix_achat(self, min_prix: float, max_prix: float) -> List[EnRayon]:
    return self.enrayon_repo.find_by_prix_achat_between_and_supprimer(min_prix, max_prix, 0)

  def get_produits_par_intervalle_prix_vente(self, min_prix: float, max_prix: float) -> List[EnRayon]:
    return self.enrayon_repo.find_by_prix_vente_between_and_supprimer(min_prix, max_prix, 0)

  # ---------------------------------------------------------------------
  # mettreAJourProduitEnRayon(EnRayonDto)
  # ---------------------------------------------------------------------
  def mettre_a_jour_produit(self, dto: EnRayonDto) -> EnRayon:
    en_rayon = self.enrayon_repo.find_by_id(str(dto.enRayonId))
    if not en_rayon:
      raise HTTPException(status_code=404, detail=f"Produit en rayon introuvable: {dto.enRayonId}")

    produit = self.produit_repo.find_by_id(int(en_rayon.produit_id or 0))
    if not produit:
      raise HTTPException(status_code=404, detail=f"Produit introuvable: {en_rayon.produit_id}")

    # MAJ stock produit: (stock - ancien restant) + nouveau restant
    produit.stock = (produit.stock or 0) - (en_rayon.quantite_restante or 0) + int(dto.quantiteRestante or 0)
    self.produit_repo.save(produit)

    # MAJ EnRayon
    en_rayon.reduction = dto.reductionMax
    en_rayon.prix_achat = dto.prixAchat
    en_rayon.prix_vente = dto.prixVente
    en_rayon.quantite_restante = dto.quantiteRestante
    en_rayon.date_peremption = _parse_iso_dt(dto.datePeremption)
    return self.enrayon_repo.save(en_rayon)

  # ---------------------------------------------------------------------
  # getProduitsEnRayonPageable(...) -> Page<Map<String, Any?>>
  # ---------------------------------------------------------------------
  def get_produits_pageable(
    self,
    nom_produit: Optional[str],
    bientot_perimee: Optional[bool],
    jours_avant_peremption: Optional[int],
    en_stock: Optional[bool],
    page: int,
    size: int,
    sort: str = "id",
    direction: str = "desc",
  ) -> Dict[str, Any]:
    """
    Émule la Page<Map<...>> Spring : renvoie un dict {content, totalElements, totalPages, pageSize, pageNumber}
    """
    rows, total = self.enrayon_repo.filter_en_rayon(
      nom_produit=nom_produit,
      bientot_perimee=bientot_perimee,
      jours_avant_peremption=jours_avant_peremption,
      en_stock=en_stock,
      page=page,
      size=size,
      sort_by=sort,
      direction=direction)

    def _map(er: EnRayon) -> Dict[str, Any]:
      prod = self.produit_repo.find_by_id(int(er.produit_id or 0))
      return {
        "id": er.id,
        "produitId": getattr(prod, "id", None),
        "produitNom": getattr(prod, "nom", None),
        "rayonId": getattr(getattr(prod, "rayon", None), "id", None),
        "rayonNom": getattr(getattr(prod, "rayon", None), "nom", None),
        "fournisseurId": getattr(getattr(er, "fournisseur", None), "id", None),
        "fournisseurNom": getattr(getattr(er, "fournisseur", None), "nom", None),
        "commandeId": getattr(getattr(er, "commande", None), "id", None),
        "commandeRef": getattr(getattr(er, "commande", None), "ref", None),
        "dateLivraison": er.date_livraison,
        "datePeremption": er.date_peremption,
        "prixAchat": er.prix_achat,
        "prixVente": er.prix_vente,
        "reduction": er.reduction,
        "quantite": er.quantite,
        "quantiteRestante": er.quantite_restante,
        "supprimer": er.supprimer,
      }

    content = [_map(er) for er in rows]
    total_pages = (total + size - 1) // size if size else 1
    return {
      "content": content,
      "totalElements": total,
      "totalPages": total_pages,
      "pageSize": size,
      "pageNumber": page,
    }

  # ---------------------------------------------------------------------
  # getProduitsEnRayonPageableNew(...) -> EnRayonPageableCustomDto
  # ---------------------------------------------------------------------
  def get_produits_pageable_new(
    self,
    nom_produit: Optional[str],
    bientot_perimee: Optional[bool],
    jours_avant_peremption: Optional[int],
    start_date: Optional[str],
    end_date: Optional[str],
    en_stock: Optional[bool],
    page: str,
    size: str,
    sort: str,
    direction: str,
  ) -> Dict[str, Any]:
    rows, total = self.enrayon_repo.filter_en_rayon_range(
      nom_produit=nom_produit,
      start_date=start_date,
      end_date=end_date,
      bientot_perimee=bientot_perimee,
      jours_avant_peremption=jours_avant_peremption,
      en_stock=en_stock,
      page=int(page),
      size=int(size),
      sort_by=sort,
      direction=direction)

    # Map content (comme en Kotlin)
    content: List[Dict[str, Any]] = []
    for er in rows:
      prod = self.produit_repo.find_by_id(int(er.produit_id or 0))
      if not prod:
        continue
      content.append({
        "id": er.id,
        "produitId": getattr(prod, "id", None),
        "produitNom": getattr(prod, "nom", None),
        "rayonId": getattr(getattr(prod, "rayon", None), "id", None),
        "rayonNom": getattr(getattr(prod, "rayon", None), "nom", None),
        "fournisseurId": getattr(getattr(er, "fournisseur", None), "id", None),
        "fournisseurNom": getattr(getattr(er, "fournisseur", None), "nom", None),
        "commandeId": getattr(getattr(er, "commande", None), "id", None),
        "commandeRef": getattr(getattr(er, "commande", None), "ref", None),
        "dateLivraison": er.date_livraison,
        "datePeremption": er.date_peremption,
        "prixAchat": er.prix_achat,
        "prixVente": er.prix_vente,
        "reduction": er.reduction,
        "quantite": er.quantite,
        "quantiteRestante": er.quantite_restante,
        "supprimer": er.supprimer,
      })

    # Totaux (recalcule via une seconde requête non paginée)
    total_amount_enrayon = 0
    total_qte = 0
    if total > 0:
      all_rows, _ = self.enrayon_repo.filter_en_rayon_range(
        nom_produit=nom_produit,
        start_date=start_date,
        end_date=end_date,
        bientot_perimee=bientot_perimee,
        jours_avant_peremption=jours_avant_peremption,
        en_stock=en_stock,
        page=0,
        size=total,
        sort_by="date_livraison",
        direction="desc")
      total_amount_enrayon = sum(int(er.prix_vente or 0) * int(er.quantite_restante or 0) for er in all_rows)
      total_qte = sum(int(er.quantite_restante or 0) for er in all_rows)

    total_pages = (total + int(size) - 1) // int(size) if int(size) else 1
    # return EnRayonPageableCustomDto(
    #   content=content,
    #   totalElements=total,
    #   totalPages=total_pages,
    #   pageSize=size,
    #   pageNumber=page,
    #   totalAmountEnRayon=total_amount_enrayon,
    #   totalQte=total_qte,
    #   data={}
    # )
    return {
      "content": {
        "content": content,
        "totalElements": total,
        "totalPages": total_pages,
        "pageSize": size,
        "pageNumber": page,
        "totalAmountEnRayon": total_amount_enrayon,
        "totalQte": total_qte,
        "data": {}
      },
      "totalElements": total,
      "totalPages": total_pages,
      "pageSize": size,
      "pageNumber": page,
      "totalAmountEnRayon": total_amount_enrayon,
      "totalQte": total_qte,
      "data": {}
    }

  # ---------------------------------------------------------------------
  # getProduitsEnRayonPageableProduitRange(...)
  # ---------------------------------------------------------------------
  def get_produits_pageable_produit_range(
    self,
    nom_produit: Optional[str],
    produit_id: Optional[str],
    supprimer: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    bientot_perimee: Optional[str],
    jours_avant_peremption: Optional[str],
    en_stock: Optional[str],
    page: str,
    size: str,
    sort: str,
    direction: str,
  ) -> Dict[str, Any]:
    page_i, size_i = int(page), int(size)

    rows, total = self.enrayon_repo.filter_en_rayon_range_with_produit_id(
      produit_id=produit_id,
      supprimer=supprimer,
      start_date=start_date,
      end_date=end_date,
      bientot_perimee=None,
      jours_avant_peremption=None,
      en_stock=None,
      page=page_i,
      size=size_i,
      sort_by=sort,
      direction=direction,
    )

    # Produit “pivot”
    p = self.produit_repo.find_by_id(int(produit_id)) if produit_id else None

    content: List[Dict[str, Any]] = []
    for er in rows:
      content.append({
        "id": er.id,
        "produitId": getattr(p, "id", None) if p else None,
        "nom": getattr(p, "nom", None) if p else None,
        "rayonId": getattr(getattr(p, "rayon", None), "id", None) if p else None,
        "rayonNom": getattr(getattr(p, "rayon", None), "nom", None) if p else None,
        "fournisseurId": getattr(getattr(er, "fournisseur", None), "id", None),
        "nomFournisseur": getattr(getattr(er, "fournisseur", None), "nom", None),
        "codeFournisseur": getattr(getattr(er, "fournisseur", None), "code", None),
        "commandeId": getattr(getattr(er, "commande", None), "id", None),
        "commandeRef": getattr(getattr(er, "commande", None), "ref", None),
        "dateLivraison": er.date_livraison,
        "datePeremption": er.date_peremption,
        "prixAchat": er.prix_achat,
        "prixVente": er.prix_vente,
        "reduction": er.reduction,
        "quantiteRecu": er.quantite,
        "quantiteStock": er.quantite_restante,
        "supprimer": er.supprimer,
      })

    total_amount_enrayon = 0
    total_qte = 0
    total_commande_qte = 0
    if total > 0:
      all_rows, _ = self.enrayon_repo.filter_en_rayon_range_with_produit_id(
        produit_id=produit_id,
        supprimer=supprimer,
        start_date=start_date,
        end_date=end_date,
        bientot_perimee=None,
        jours_avant_peremption=None,
        en_stock=None,
        page=0,
        size=total,
        sort_by="dateLivraison",
        direction="desc",
      )

      total_amount_enrayon = sum(int(er.prix_vente or 0) * int(er.quantite_restante or 0) for er in all_rows)
      total_qte = sum(int(er.quantite_restante or 0) for er in all_rows)
      total_commande_qte = sum(int(er.quantite or 0) for er in all_rows)

    total_pages = (total + size_i - 1) // size_i if size_i else 1
    return {
      "content": {
        "content": content,
        "totalElements": total,
        "totalPages": total_pages,
        "pageSize": size_i,
        "pageNumber": page_i,
        "totalAmountEnRayon": total_amount_enrayon,
        "totalQte": total_qte,
        "data": {
          "totalAmountEnRayon": total_amount_enrayon,
          "totalQte": total_qte,
          "totalCommandeQte": total_commande_qte,
        }
      },
      "totalElements": total,
      "totalPages": total_pages,
      "pageSize": size_i,
      "pageNumber": page_i,
      "totalAmountEnRayon": total_amount_enrayon,
      "totalQte": total_qte,
      "data": {
        "totalAmountEnRayon": total_amount_enrayon,
        "totalQte": total_qte,
        "totalCommandeQte": total_commande_qte,
      }
    }

  # ---------------------------------------------------------------------
  # deleteEnRayon(id)
  # ---------------------------------------------------------------------
  def delete_enrayon(self, id_: int) -> None:
    if not self.enrayon_repo.exists_by_id(str(id_)):
      raise HTTPException(status_code=404, detail=f"EnRayon {id_} introuvable")
    er = self.enrayon_repo.find_by_id(str(id_))
    er.supprimer = 1
    self.enrayon_repo.save(er)

  # ---------------------------------------------------------------------
  # ajouterUnProduitManquantEnRayon(produitId)
  # ---------------------------------------------------------------------
  def ajouter_un_produit_manquant(self, produit_id: int) -> Dict[str, Any]:
    exists = self.enrayon_repo.find_by_produit_id_and_supprimer(produit_id, 0)
    if exists:
      return {"message": "Produit existe deja en rayon", "type": "error"}

    produit = self.produit_repo.find_by_id(produit_id)
    if not produit:
      raise HTTPException(status_code=404, detail=f"Produit introuvable: {produit_id}")

    er = EnRayon(
      produit=produit,
      produit_id=produit_id,
      fournisseur=None,
      commande=None,
      date_livraison=datetime.now(),
      date_peremption=None,
      prix_achat=0,
      prix_vente=0,
      reduction=0,
      quantite=0,
      quantite_restante=0,
      supprimer=0,
    )
    self.enrayon_repo.save(er)
    return {"message": "Produit ajouter en rayon", "type": "success"}

  # ---------------------------------------------------------------------
  # ajouterTousLesProduitsManquantEnRayon()
  # ---------------------------------------------------------------------
  def ajouter_tous_produits_manquants(self) -> Dict[str, Any]:
    manquants = self.produit_repo.find_produits_non_en_rayon()
    if not manquants:
      return {"message": "Produit existe deja en rayon", "type": "error"}

    nouveaux: List[EnRayon] = []
    for pm in manquants:
      produit = self.produit_repo.find_by_id(pm.id)
      er = EnRayon(
        produit=produit,
        produit_id=getattr(produit, "id", None),
        fournisseur=None,
        commande=None,
        date_livraison=datetime.now(),
        date_peremption=None,
        prix_achat=0,
        prix_vente=0,
        reduction=0,
        quantite=0,
        quantite_restante=0,
        supprimer=0,
      )
      nouveaux.append(er)
    self.enrayon_repo.save_all(nouveaux)
    return {"message": f"Vous avez ajouter {len(nouveaux)} produits en rayon", "type": "success"}
