# services/sortie_stock_service.py
from sqlalchemy.orm import Session
from datetime import datetime

from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.sortie_stock_repository import SortieStockRepository
from app.repositories.type_sortie_repository import TypeSortieRepository
from app.schemas.sortie_dto import SortieDetailDto
from typing import Any, Dict, List, Optional, Tuple
from math import ceil
from datetime import datetime


# On part du principe que ces repositories existent déjà
# et offrent des méthodes utilisées ci-dessous.
# - produit_detail_repo.find_by_id(id: int) -> ProduitDetail | None
# - sortie_stock_repo.filter_sortie_stock(...) -> spec (dict/objet)
# - sortie_stock_repo.filter_sortie_stock_range(...) -> spec (dict/objet)
# - sortie_stock_repo.find_all(spec, page, size, sort, direction) -> (rows, total)
# - en_rayon_repo.find_by_id(id: int) -> EnRayon | None
# - produit_repo.find_by_id(id: int) -> Produit | None
# - type_sortie_repo.find_by_id(id: int) -> TypeSortie | None
# - sortie_stock_repo.save(entity) -> SortieStock
#
# Et que vos entités/modèles Python ont des attributs alignés
# (ex. sortie.detail_id, sortie.type_sortie.nom, etc.).

class SortieStockService:
  def __init__(self, db: Session):
    self.db = db
    self.produit_detail_repo = ProduitDetailRepository(db)
    self.sortie_stock_repo = SortieStockRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.type_sortie_repo = TypeSortieRepository(db)
    self.produit_repo = ProduitRepository(db)

  # =========
  # 1) Liste pageable (filtre simple)
  # =========
  def get_sortie_stock_pageable(
    self,
    nom_produit: Optional[str] = None,
    type_sortie: Optional[str] = None,
    en_rayon_id: Optional[int] = None,
    produit_detail_id: Optional[int] = None,
    *,
    page: int = 0,
    size: int = 20,
    sort: str = "dateSortie",
    direction: str = "DESC",
  ) -> Dict[str, Any]:
    rows, total = self.sortie_stock_repo.filter_sortie_stock_range(
      nom_produit=nom_produit, type_sortie=type_sortie,
      en_rayon_id=en_rayon_id, produit_detail_id=produit_detail_id,
      page=page, size=size, sort_by=sort, direction=direction
    )

    def _map_row(sortie) -> Optional[Dict[str, Any]]:
      # produitDetail si detail_id présent et convertible
      produit_detail = None
      if getattr(sortie, "detail_id", None):
        try:
          pid = int(sortie.detail_id)
          produit_detail = self.produit_detail_repo.find_by_id(pid)
        except (TypeError, ValueError):
          pass

      # enRayon / produit
      en_rayon = None
      if getattr(sortie, "en_rayon", None) and getattr(sortie.en_rayon, "id", None):
        en_rayon = self.enrayon_repo.find_by_id(int(sortie.en_rayon.id))

      if not en_rayon or not getattr(en_rayon, "produit_id", None):
        return None

      produit = self.produit_repo.find_by_id(int(en_rayon.produit_id))
      if not produit:
        return None

      nom = getattr(produit, "nom", None)
      _id = getattr(produit, "id", None)

      # Si typeSortie == "detail", on remonte le nom/id du ProduitDetail référencé par l'id enRayon (!)
      if getattr(sortie, "type_sortie", None) and getattr(sortie.type_sortie, "nom", None) == "detail":
        try:
          pd = self.produit_detail_repo.find_by_id(int(sortie.en_rayon.id))
          if pd:
            nom = getattr(pd, "nom", nom)
            _id = getattr(pd, "id", _id)
        except Exception:
          pass

      return {
        "id": getattr(sortie, "id", None),
        "nomProduit": nom,
        "typeSortie": getattr(sortie, "type_sortie", None),
        "enRayonId": getattr(sortie.en_rayon, "id", None) if getattr(sortie, "en_rayon", None) else None,
        "produitDetailId": getattr(sortie, "detail_id", None),
        "produitDetailNom": getattr(produit_detail, "nom", None) if produit_detail else None,
        "produitDetailPrix": getattr(produit_detail, "prix", None) if produit_detail else None,
        "quantite": getattr(sortie, "quantite", None),
        "dateSortie": getattr(sortie, "date_sortie", None) or getattr(sortie, "dateSortie", None),
      }

    content = [m for m in (map(_map_row, rows)) if m is not None]

    return {
      "content": {
        "content": content,
        "totalElements": total,
        "totalPages": ceil(total / size) if size else 1,
        "pageSize": size,
        "pageNumber": page + 1,  # si vous souhaitez un index 1-based côté client
      },
      "totalElements": total,
      "totalPages": ceil(total / size) if size else 1,
      "pageSize": size,
      "pageNumber": page + 1,  # si vous souhaitez un index 1-based côté client
    }

  # =========
  # 2) Liste pageable (plage de dates + agrégats)
  # =========
  def get_sortie_stock_pageable_product_range(
    self,
    nom_produit: Optional[str],
    produit_id: Optional[str],
    supprimer: Optional[str],
    start_date: Optional[str],
    end_date: Optional[str],
    type_sortie: Optional[str],
    en_rayon_id: Optional[int],
    produit_detail_id: Optional[int],
    *,
    page: int = 0,
    size: int = 20,
    sort: str = "dateSortie",
    direction: str = "DESC",
  ) -> Dict[str, Any]:
    rows, total = self.sortie_stock_repo.filter_sortie_stock_range(
      nom_produit=nom_produit,
      produit_id=produit_id,
      supprimer=supprimer,
      start_date=start_date,
      end_date=end_date,
      type_sortie=type_sortie,
      en_rayon_id=en_rayon_id,
      produit_detail_id=produit_detail_id,
      page=page, size=size, sort_by=sort, direction=direction
    )

    def _map_row(sortie) -> Optional[Dict[str, Any]]:
      # produitDetail si detail_id présent et convertible
      produit_detail = None
      if getattr(sortie, "detail_id", None):
        try:
          pid = int(sortie.detail_id)
          produit_detail = self.produit_detail_repo.find_by_id(pid)
        except (TypeError, ValueError):
          pass

      en_rayon = None
      if getattr(sortie, "en_rayon", None) and getattr(sortie.en_rayon, "id", None):
        en_rayon = self.enrayon_repo.find_by_id(int(sortie.en_rayon.id))

      if not en_rayon or not getattr(en_rayon, "produit_id", None):
        return None

      produit = self.produit_repo.find_by_id(int(en_rayon.produit_id))
      if not produit:
        return None

      nom = getattr(produit, "nom", None)
      forme = getattr(getattr(produit, "forme", None), "nom", None)
      _id = getattr(produit, "id", None)

      if getattr(sortie, "type_sortie", None) and getattr(sortie.type_sortie, "nom", None) == "detail":
        try:
          pd = self.produit_detail_repo.find_by_id(int(sortie.en_rayon.id))
          if pd:
            nom = getattr(pd, "nom", nom)
            _id = getattr(pd, "id", _id)
            forme = ""  # comme dans le code Kotlin
        except Exception:
          pass

      return {
        "id": getattr(sortie, "id", None),
        "nom": nom,
        "forme": forme,
        "typeSortie": getattr(sortie, "type_sortie", None),
        "enRayonId": getattr(sortie.en_rayon, "id", None) if getattr(sortie, "en_rayon", None) else None,
        "produitDetailId": getattr(sortie, "detail_id", None),
        "produitDetailNom": getattr(produit_detail, "nom", None) if produit_detail else None,
        "produitDetailPrix": getattr(produit_detail, "prix", None) if produit_detail else None,
        "quantite": getattr(sortie, "quantite", None),
        "dateSortie": getattr(sortie, "date_sortie", None) or getattr(sortie, "dateSortie", None),
      }

    content = [m for m in (map(_map_row, rows)) if m is not None]

    # Agrégats (version Python)
    total_amount_recu = 0.0
    total_amount_commande = 0.0
    total_qte_recu = 0
    total_qte_commande = 0

    if total > 0:
      # On récupère toutes les lignes pour sommer les quantités

      all_rows, _ = self.sortie_stock_repo.filter_sortie_stock_range(
        nom_produit=nom_produit,
        produit_id=produit_id,
        supprimer=supprimer,
        start_date=start_date,
        end_date=end_date,
        type_sortie=type_sortie,
        en_rayon_id=en_rayon_id,
        produit_detail_id=produit_detail_id,
        page=0, size=total, sort_by="date_sortie", direction="DESC"
      )

      total_qte_recu = sum(int(getattr(s, "quantite", 0) or 0) for s in all_rows)

    return {
      "content": {
        "content": content,
        "totalElements": total,
        "totalPages": ceil(total / size) if size else 1,
        "pageSize": size,
        "pageNumber": page + 1,
        "totalAmountRecu": total_amount_recu,
        "totalAmountCommande": total_amount_commande,
        "totalQteRecu": total_qte_recu,
        "totalQteCommande": total_qte_commande,
      },
      "totalElements": total,
      "totalPages": ceil(total / size) if size else 1,
      "pageSize": size,
      "pageNumber": page + 1,
      "totalAmountRecu": total_amount_recu,
      "totalAmountCommande": total_amount_commande,
      "totalQteRecu": total_qte_recu,
      "totalQteCommande": total_qte_commande,
    }

  # =========
  # 3) addProduitDetail (mise à jour des stocks + création SortieStock)
  # =========
  def add_produit_detail(self, sortie: "SortieDetailDto"):
    """
    - Met à jour le stock du ProduitDetail (si fourni)
    - Décrémente les quantités en rayon et produit
    - Crée des enregistrements SortieStock
    Retourne le ProduitDetail mis à jour (ou None).
    """
    produit_detail = None

    # Si un produitDetailId est fourni et non 'null'
    if getattr(sortie, "produit_detail_id", None) not in (None, "null"):
      pid = int(sortie.produit_detail_id)
      produit_detail = self.produit_detail_repo.find_by_id(pid)
      if produit_detail:
        # + somme(enrayon.contenuDetail * enrayon.quantite)
        add_stock = 0
        for er in (sortie.enrayon or []):
          contenu_detail = getattr(er, "contenu_detail", None)
          qte = int(getattr(er, "quantite", 0) or 0)
          if contenu_detail not in (None, "null"):
            try:
              add_stock += int(contenu_detail) * qte
            except (TypeError, ValueError):
              pass
        # Mise à jour stock ProduitDetail
        produit_detail.stock = (produit_detail.stock or 0) + add_stock
        produit_detail = self.produit_detail_repo.save(produit_detail)

    # Pour chaque mouvement en rayon
    for er in (sortie.enrayon or []):
      qte = int(getattr(er, "quantite", 0) or 0)
      contenu_detail = getattr(er, "contenu_detail", None)

      en_rayon = self.enrayon_repo.find_by_id(int(er.rayon_id))
      if not en_rayon:
        continue

      # Décrément du stock en rayon
      en_rayon.quantite_restante = (en_rayon.quantite_restante or 0) - qte
      self.enrayon_repo.save(en_rayon)

      # Décrément du stock du produit
      produit = self.produit_repo.find_by_id(int(en_rayon.produit_id))
      if produit:
        produit.stock = (produit.stock or 0) - qte
        self.produit_repo.save(produit)

      # Création de la sortie
      ss = self.sortie_stock_repo.model()  # Option: une fabrique ou modèle SQLAlchemy
      ss.en_rayon = en_rayon
      if contenu_detail not in (None, "null"):
        # Type sortie détaillée (id = 1 dans le code Kotlin)
        ss.type_sortie = self.type_sortie_repo.find_by_id(1)
        ss.detail_id = str(getattr(sortie, "produit_detail_id", ""))
      else:
        ss.type_sortie = self.type_sortie_repo.find_by_id(int(sortie.type_sortie_id))
        ss.detail_id = None

      ss.quantite = qte
      ss.date_sortie = datetime.utcnow()
      ss.supprimer = 0
      self.sortie_stock_repo.save(ss)

    return produit_detail
