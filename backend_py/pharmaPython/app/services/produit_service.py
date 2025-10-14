# services/produit_service.py
from __future__ import annotations
from dataclasses import asdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal, ROUND_HALF_UP

from app.models.categorie import Categorie
from app.models.employe import Employe
from app.models.fournisseur import Fournisseur
from app.models.produit import Produit
from app.models.produit_retour import ProduitRetour
from app.models.rayon import Rayon
from app.models.retour_produit import RetourProduit
from app.repositories.caisse_repository import CaisseRepository
from app.repositories.categorie_repository import CategorieRepository
from app.repositories.commande_repository import CommandeRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.fabriquant_repository import FabriquantRepository
from app.repositories.forme_repository import FormeRepository
from app.repositories.fournisseur_repository import FournisseurRepository
from app.repositories.magasin_repository import MagasinRepository
from app.repositories.produit_cmd_repository import ProduitCmdRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.produit_retour_repository import ProduitRetourRepository
from app.repositories.rayon_repository import RayonRepository
from app.repositories.retour_produit_repository import RetourProduitRepository
from app.repositories.sortie_stock_repository import SortieStockRepository
from app.repositories.vente_repository import VenteRepository
from app.schemas.produit_detail_dto import ProduitRequestNewDto
from app.services.ai.search_index import semantic_search
from app.services.caisse_service import CaisseService
from app.utility.user_utils import UserUtils


# --- Helpers -----------------------------------------------------------------

def _require(obj, msg: str):
  if obj is None:
    raise HTTPException(status_code=404, detail=msg)
  return obj


def _bd(v) -> Decimal:
  if v is None:
    return Decimal("0")
  return Decimal(str(v))


def _round2(x: Decimal) -> Decimal:
  return x.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _page_tuple(page: int, size: int) -> Tuple[int, int]:
  return (max(0, int(page)), max(1, int(size)))


# --- Service -----------------------------------------------------------------

class ProduitService:
  """
  Port Python du ProduitService Kotlin.
  Remplace les repositories Spring par des DAO/Repositories SQLAlchemy injectés.
  """

  def __init__(
    self,
    db: Session
  ):
    self.db = db
    self.user_utils = UserUtils
    self.retour_produit_repo = RetourProduitRepository(db)
    self.produit_retour_repo = ProduitRetourRepository(db)
    self.produit_cmd_repo = ProduitCmdRepository(db)
    self.produit_detail_repo = ProduitDetailRepository(db)
    self.employe_repo = EmployeRepository(db)
    self.concerner_repo = ConcernerRepository(db)
    self.vente_repo = VenteRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.categorie_repo = CategorieRepository(db)
    self.fournisseur_repo = FournisseurRepository(db)
    self.rayon_repo = RayonRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.forme_repo = FormeRepository(db)
    self.magasin_repo = MagasinRepository(db)
    self.fabriquant_repo = FabriquantRepository(db)
    self.caisse_repo = CaisseRepository(db)
    self.commande_repo = CommandeRepository(db)
    self.caisse_service = CaisseService
    self.sortie_stock_repo = SortieStockRepository(db)

  # ----------------------------------------------------------------------
  # createProduit(request)
  # ----------------------------------------------------------------------
  def create_produit(self, request) -> Dict[str, Any]:
    # Unicité par code-barres
    if getattr(request, "codeUbipharm", None):
      if self.produit_repo.find_by_code_ubipharm_and_supprimer(request.codeUbipharm):
        raise HTTPException(422, detail=f"Un produit avec le code-barres '{request.codeUbipharm}' existe déjà.")

    # Prix conseillé (marge & TVA)
    prix_achat = _bd(getattr(request, "prixAchat", 0))
    marge = _bd(getattr(request, "margeBeneficiaire", 0))  # ex: 0.20
    tva = _bd(getattr(request, "tva", 0))  # ex: 0.20
    pvc_ht = prix_achat * (Decimal("1") + marge)
    pvc_ttc = _round2(pvc_ht * (Decimal("1") + tva))

    produit = Produit  # instance SQLAlchemy (ex: Produit())
    produit.ean13 = request.ean13
    produit.codeLaborex = request.codeLaborex
    produit.codeUbipharm = request.codeUbipharm
    produit.reference = request.reference
    produit.nom = request.nom
    produit.stock = request.stock
    produit.stockMax = request.stockMax
    produit.stockMin = request.stockMin
    produit.contenuDetail = request.contenuDetail
    produit.prixDetail = str(request.prixDetail) if request.prixDetail is not None else "0"
    produit.etat = request.etat
    produit.reductionMax = request.reductionMax
    produit.grossisteId = request.grossisteId
    produit.detailId = request.detailId
    produit.categorie = _require(self.categorie_repo.find_by_id(request.categorie), "Catégorie introuvable")
    produit.forme = _require(self.forme_repo.find_by_id(request.forme), "Forme introuvable")
    produit.fabriquant = _require(self.fabriquant_repo.find_by_id(request.fabriquant), "Fabriquant introuvable")
    produit.rayon = _require(self.rayon_repo.find_by_id(request.rayon), "Rayon introuvable")
    produit.magasin = _require(self.magasin_repo.find_by_id(request.magasin), "Magasin introuvable")
    produit.supprimer = 0

    saved = self.produit_repo.save(produit)
    # (La tarification initiale est commentée dans le Kotlin)

    return self._map_to_produit_response_dto(saved)  # dict Pydantic-like

  # ----------------------------------------------------------------------
  # createProduitNew(request)
  # ----------------------------------------------------------------------
  def create_produit_new(self, request) -> Any:
    if getattr(request, "codeUbipharm", None):
      if self.produit_repo.find_by_code_ubipharm_and_supprimer(request.codeUbipharm):
        raise HTTPException(422, detail=f"Un produit avec le code-barres '{request.codeUbipharm}' existe déjà.")

    produit = Produit()
    produit.ean13 = request.ean13
    produit.codeLaborex = request.codeLaborex
    produit.codeUbipharm = request.codeUbipharm
    produit.reference = request.reference
    produit.nom = request.nom
    produit.stock = request.stock or 0
    produit.stockMax = request.stockMax or 0
    produit.stockMin = request.stockMin or 0
    produit.contenuDetail = request.contenuDetail
    produit.prixDetail = str(request.prixDetail) if request.prixDetail is not None else "0"
    produit.etat = request.etat
    produit.reductionMax = request.reductionMax or 0
    produit.categorie = self.categorie_repo.find_by_id(int(request.categorieId)) if request.categorieId else None
    produit.forme = self.forme_repo.find_by_id(int(request.formeId)) if request.formeId else None
    produit.fabriquant = self.fabriquant_repo.find_by_id(int(request.fabriquantId)) if request.fabriquantId else None
    produit.rayon = self.rayon_repo.find_by_id(int(request.rayonId)) if request.rayonId else None
    produit.magasin = self.magasin_repo.find_by_id(int(request.magasinId)) if request.magasinId else None
    produit.supprimer = 0
    return self.produit_repo.save(produit)

  # ----------------------------------------------------------------------
  # getProduitById(id)  /  getProduitByIdMap(id)
  # ----------------------------------------------------------------------
  def get_produit_by_id(self, id_: int) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(id_)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")
    return self._map_to_produit_response_dto(p)

  def get_produit_by_id_map(self, id_: int) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(id_)
    # if not p or int(p.supprimer or 0) != 0:
    #   raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")
    return self._map_to_produit_response_map(p)

  # ----------------------------------------------------------------------
  # getProduitDetailById(id)  /  getEnRayonDetailById(enRayonId)
  # ----------------------------------------------------------------------
  def get_produit_detail_by_id(self, id_: int) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(id_)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")
    return {
      "id": p.id,
      "nom": p.nom,
      "stock": p.stock,
      "categorie": getattr(p.categorie, "nom", None),
      "prixAchat": 0,
      "prixVente": 0,
      "etat": p.etat,
    }

  def get_enrayon_detail_by_id(self, enrayon_id: str) -> Dict[str, Any]:
    er = _require(self.enrayon_repo.find_by_id(str(enrayon_id)), "EnRayon introuvable")
    p = _require(self.produit_repo.find_by_id(int(er.produit_id)), "Produit introuvable")
    return {
      "id": p.id,
      "rayonId": er.id,
      "nom": p.nom,
      "stock": er.quantiteRestante,
      "dateLivraison": er.dateLivraison,
      "datePeremption": er.datePeremption,
      "categorie": getattr(p.categorie, "nom", None),
      "prixAchat": 0,
      "prixVente": 0,
      "type": "produit",
    }

  # ----------------------------------------------------------------------
  # getProduitEnRayonDetailById(id)
  # ----------------------------------------------------------------------
  def get_produit_enrayon_detail_by_id(self, id_: int) -> List[Dict[str, Any]]:
    if id_ < 700:
      pd = _require(self.produit_detail_repo.find_by_id(id_), "ProduitDetail introuvable")
      p_stock = self.produit_detail_repo.find_by_id_and_stock_greater_than_and_supprimer(id_)
      return [{
        "id": pd.id,
        "rayonId": getattr(p_stock, "id", None),
        "nom": pd.nom,
        "stock": getattr(p_stock, "stock", 0),
        "dateLivraison": "",
        "datePeremption": "",
        "categorie": pd.grossisteList,
        "prixAchat": 0,
        "prixVente": 0,
        "type": "detail",
      }]
    # produit « normal »
    p = self.produit_repo.find_by_id(id_)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")
    enrayons = self.enrayon_repo.find_all_by_produit_id_and_supprimer_and_quantite_restante_gt(p.id)
    return [{
      "id": p.id,
      "rayonId": er.id,
      "nom": p.nom,
      "stock": er.quantite_restante,
      "dateLivraison": er.date_livraison,
      "datePeremption": er.date_peremption,
      "categorie": getattr(p.categorie, "nom", None),
      "prixAchat": 0,
      "prixVente": 0,
      "type": "produit",
    } for er in enrayons]

  # ----------------------------------------------------------------------
  # getAllProduits(pageable)  &  toResponseDto()
  # ----------------------------------------------------------------------
  def get_all_produits(self, page: int, size: int) -> Dict[str, Any]:
    page, size = _page_tuple(page, size)
    rows, total = self.produit_repo.filter_with_spec(
      query="a",
      rayon_id="null",
      fabriquant_id="null",
      etagere_id="null",
      forme_id="null",
      magasin_id="null",
      categorie_id="null",
      page=page, size=size)
    content = [self._to_response_dto(it) for it in rows]
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
    }

  def _to_response_dto(self, p) -> Dict[str, Any]:

    return {
      "id": p.id,
      "nom": p.nom or "",
      "description": "",
      "codebarre": p.code_ubipharm or "",
      "image": "",
      "seuil": p.stock_min or 0,
      "supprimer": p.supprimer or 0,
      "categorieNom": getattr(getattr(p, "categorie", None), "nom", "") or "",
      "tva": float("0.00"),
      "prixAchatInitial": float("0.00"),
      "prixVenteActuel": float("0.00"),
      "margeBeneficiaire": float("0.00"),
      "prixVenteConseille": float("0.00"),
      "quantiteTotaleEnStock": p.stock or 0,
      "dateCreation": None,
      "dateModification": None,
      "stockDetails": [],
      "uniteMesure": getattr(getattr(p, "forme", None), "nom", "") or "",
    }

  # ----------------------------------------------------------------------
  # searchProducts(query, page, size)  /  searchProductsWithParam(...)
  # ----------------------------------------------------------------------
  def search_products(self, query: Optional[str], page: int, size: int) -> Dict[str, Any]:
    page, size = _page_tuple(page, size)
    rows, total = self.produit_repo.filter_with_spec(
      query=query,
      rayon_id="null",
      fabriquant_id="null",
      etagere_id="null",
      forme_id="null",
      magasin_id="null",
      categorie_id="null",
      page=page, size=size)
    content = []
    for produit in rows:
      enrayon = self.enrayon_repo.find_top_by_produit_id_order_by_date_livraison_desc(produit.id)
      content.append({
        "id": produit.id,
        "reductionMax": produit.reduction_max,
        "codebarre": produit.code_ubipharm,
        "ean13": produit.ean13,
        "nom": produit.nom,
        "categorieNom": getattr(produit.categorie, "nom", None),
        "uniteMesure": getattr(produit.forme, "nom", None),
        "stock": produit.stock,
        "prixAchatInitial": getattr(enrayon, "prixAchat", 0) if enrayon else 0,
        "prixVenteActuel": getattr(enrayon, "prixVente", 0) if enrayon else 0,
        "datePeremption": getattr(enrayon, "datePeremption", 0) if enrayon else 0,
        "quantite": 1,
        "uniteGratuite": 0,
        "supprimer": produit.supprimer or 0,
        "quantiteTotaleEnStock": produit.stock,
        "prix": 0,
        "type": "produit",
      })
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
    }

  def search_products_with_param(
    self,
    *,
    query: Optional[str],
    page: int, size: int,
    rayonId: Optional[str], fabriquantId: Optional[str], etagereId: Optional[str],
    formeId: Optional[str], magasinId: Optional[str], categorieId: Optional[str],
  ) -> Dict[str, Any]:
    page, size = _page_tuple(page, size)
    spec = {
      "query": query, "rayonId": rayonId, "fabriquantId": fabriquantId,
      "etagereId": etagereId, "formeId": formeId, "magasinId": magasinId, "categorieId": categorieId,
    }
    rows, total = self.produit_repo.find_all_by_spec(spec, page, size)
    content = [{"id": it.id, "nom": it.nom, "stock": it.stock, "prix": 0, "type": "produit"} for it in rows]
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageNumber": page,
    }

  # ----------------------------------------------------------------------
  # updateProduit(id, request)  /  addOrUpdateProduitNew(id, request)
  # ----------------------------------------------------------------------
  def update_produit(self, id_: int, request) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(id_)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")

    p.ean13 = request.ean13
    p.code_laborex = request.codeLaborex
    p.code_ubipharm = request.codeUbipharm
    p.reference = request.reference
    p.nom = request.nom
    p.stock = request.stock
    p.stock_max = request.stockMax
    p.stock_min = request.stockMin
    p.contenu_detail = request.contenuDetail
    p.prix_detail = str(request.prixDetail) if request.prixDetail is not None else "0"
    p.etat = request.etat
    p.reduction_max = request.reductionMax
    p.grossiste_id = request.grossisteId
    p.detail_id = request.detailId
    p.categorie = _require(self.categorie_repo.find_by_id(request.categorie), "Catégorie introuvable")
    p.forme = _require(self.forme_repo.find_by_id(request.forme), "Forme introuvable")
    p.fabriquant = _require(self.fabriquant_repo.find_by_id(request.fabriquant), "Fabriquant introuvable")
    p.rayon = _require(self.rayon_repo.find_by_id(request.rayon), "Rayon introuvable")
    p.magasin = _require(self.magasin_repo.find_by_id(request.magasin), "Magasin introuvable")
    p.supprimer = 0

    saved = self.produit_repo.save(p)
    return self._map_to_produit_response_dto(saved)

  def add_or_update_produit_new(self, id_: Optional[int], request: ProduitRequestNewDto) -> Dict[str, Any]:
    if not id_ or id_ == 0:
      p = Produit()
    else:
      p = self.produit_repo.find_by_id(id_)
      if not p or int(p.supprimer or 0) != 0:
        raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")

    p.ean13 = request.ean13
    p.code_laborex = request.codeLaborex
    p.code_ubipharm = request.codeUbipharm
    p.reference = request.reference
    p.nom = request.nom
    p.stock = request.stock
    p.stock_max = request.stockMax
    p.stock_min = request.stockMin
    p.contenu_detail = request.contenuDetail
    p.prix_detail = str(request.prixDetail) if request.prixDetail is not None else "0"
    p.etat = request.etat
    p.reduction_max = request.reductionMax
    p.detail_id = request.detailId
    p.categorie = _require(self.categorie_repo.find_by_id(request.categorieId), "Catégorie introuvable")
    p.forme = _require(self.forme_repo.find_by_id(request.formeId), "Forme introuvable")
    p.fabriquant = _require(self.fabriquant_repo.find_by_id(request.fabriquantId), "Fabriquant introuvable")
    p.rayon = _require(self.rayon_repo.find_by_id(request.rayonId), "Rayon introuvable")
    p.magasin = _require(self.magasin_repo.find_by_id(request.magasinId), "Magasin introuvable")
    p.supprimer = 0

    saved = self.produit_repo.save(p)
    return self._map_to_produit_response_dto(saved)

  # ----------------------------------------------------------------------
  # deleteProduit(id)
  # ----------------------------------------------------------------------
  def delete_produit(self, id_: int) -> None:
    p = self.produit_repo.find_by_id(id_)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {id_}")
    p.supprimer = 1
    self.produit_repo.save(p)

  # ----------------------------------------------------------------------
  # updateStockProduit(produitId, request)
  # ----------------------------------------------------------------------
  def update_stock_produit(self, produit_id: int, request) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(produit_id)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {produit_id}")

    er = self.enrayon_repo.find_by_produit_id_and_id_and_supprimer(p.id, str(request.rayonId))
    nouvelle_qte = int(er.quantite or 0) + int(request.quantiteChange)
    if nouvelle_qte < 0:
      raise HTTPException(422, detail=f"Quantité en stock insuffisante. Stock actuel pour ce lot: {er.quantite}")
    er.quantite = nouvelle_qte
    if int(request.quantiteChange) > 0 and getattr(er, "id", None) is None:
      er.datePeremption = request.datePeremption or er.datePeremption

    self.enrayon_repo.save(er)
    self.produit_repo.save(p)
    return self._map_to_produit_response_dto(p)

  # ----------------------------------------------------------------------
  # updateTarificationProduit(produitId, request)
  # ----------------------------------------------------------------------
  def update_tarification_produit(self, produit_id: int, request) -> Dict[str, Any]:
    p = self.produit_repo.find_by_id(produit_id)
    if not p or int(p.supprimer or 0) != 0:
      raise HTTPException(404, detail=f"Produit non trouvé avec ID: {produit_id}")
    # (Kotlin: mise à jour « vide » pour marquer la modif)
    self.produit_repo.save(p)
    return self._map_to_produit_response_dto(p)

  # ----------------------------------------------------------------------
  # createCategorie / getAllCategories / createFournisseur / getAllFournisseurs
  # createRayon / getAllRayons
  # ----------------------------------------------------------------------
  def create_categorie(self, dto) -> Dict[str, Any]:
    if self.categorie_repo.find_by_nom(dto.nom):
      raise HTTPException(422, detail=f"Une catégorie avec le nom '{dto.nom}' existe déjà.")
    c = Categorie()
    c.nom = dto.nom
    c = self.categorie_repo.save(c)
    return {"id": c.id, "nom": c.nom}

  def get_all_categories(self) -> List[Dict[str, Any]]:
    rows = self.categorie_repo.find_all_by_supprimer(0)
    return [{"id": r.id, "nom": r.nom} for r in rows]

  def create_fournisseur(self, dto) -> Dict[str, Any]:
    if getattr(dto, "email", None) and self.fournisseur_repo.find_by_email_and_supprimer(dto.email, 0):
      raise HTTPException(422, detail=f"Un fournisseur avec l'email '{dto.email}' existe déjà.")
    f = Fournisseur()
    f.nom, f.email, f.telephone = dto.nom, dto.email, dto.telephone
    f = self.fournisseur_repo.save(f)
    return {"id": f.id, "nom": f.nom, "email": f.email, "telephone": f.telephone}

  def get_all_fournisseurs(self) -> List[Dict[str, Any]]:
    rows = self.fournisseur_repo.find_all_by_supprimer(0)
    return [{"id": r.id, "nom": r.nom, "email": r.email, "telephone": r.telephone} for r in rows]

  def create_rayon(self, dto) -> Dict[str, Any]:
    r = Rayon()
    r.nom, r.code = dto.nom, dto.code
    r = self.rayon_repo.save(r)
    return {"id": r.id, "nom": r.nom, "code": r.code}

  def get_all_rayons(self) -> List[Dict[str, Any]]:
    rows = self.rayon_repo.find_all_by_supprimer(0)
    return [{"id": r.id, "nom": r.nom, "code": r.code} for r in rows]

  # ----------------------------------------------------------------------
  # retournerProduitsVendusEtEnRayon(venteId, produitsRetour)
  # ----------------------------------------------------------------------
  def retourner_produits_vendus_et_en_rayon(self, vente_id: int, produits_retour: List[Dict[str, Any]],
                                            currentEmploye: Employe):
    if not produits_retour:
      raise HTTPException(400, detail="La liste des produits à retourner ne peut pas être vide.")

    vente = _require(self.vente_repo.find_by_id(int(vente_id)), f"Vente non trouvée avec l'ID: {vente_id}")
    employe = currentEmploye
    caisse = self.caisse_service.get_caisse_active_db(self.db)

    rp = RetourProduit()
    rp.vente, rp.caisse, rp.employe = vente, caisse, employe
    rp.dateRetour = datetime.now()
    rp = self.retour_produit_repo.save(rp)

    for pr in produits_retour:
      rayon_id = str(pr["rayonId"])
      produit_id = int(pr["produitId"])
      q_retour = int(pr["quantiteRetour"])

      concerner = self.concerner_repo.find_by_vente_id_and_en_rayon_id(vente.id, rayon_id)
      if not concerner:
        raise HTTPException(404, detail=f"Produit non trouvé dans la vente avec l'ID: {produit_id}")
      if q_retour <= 0:
        raise HTTPException(400, detail="La quantité retournée doit être supérieure à zéro.")
      if q_retour > int(concerner.quantite or 0):
        raise HTTPException(400, detail="La quantité retournée ne peut pas dépasser la quantité vendue.")

      # MAJ concerner
      concerner.quantite = int(concerner.quantite or 0) - q_retour
      concerner = self.concerner_repo.save(concerner)

      # Ligne de retour
      pr_line = ProduitRetour()
      pr_line.retourProduit = rp
      pr_line.concerner = concerner
      pr_line.quantite = q_retour
      self.produit_retour_repo.save(pr_line)

      # MAJ stock produit + enrayon
      p = _require(self.produit_repo.find_by_id(produit_id), f"Produit non trouvé avec l'ID: {produit_id}")
      p.stock = int(p.stock or 0) + q_retour
      self.produit_repo.save(p)

      er = _require(self.enrayon_repo.find_by_id(rayon_id), "EnRayon introuvable")
      er.quantiteRestante = int(er.quantiteRestante or 0) + q_retour
      self.enrayon_repo.save(er)

    return rp

  # ----------------------------------------------------------------------
  # getProduitDetails(produitId)  (ventes/commandes/stock agrégés)
  # ----------------------------------------------------------------------
  def get_produit_details(self, produit_id: int) -> Dict[str, Any]:
    p = _require(self.produit_repo.find_by_id(produit_id), "Produit introuvable")
    now = datetime.now()
    start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # VENTES
    toutes = self.concerner_repo.find_by_produit_id(int(p.id))
    ventes_du_mois = []
    for c in toutes:
      v = self.vente_repo.find_by_id(int(c.vente_id))
      if v and getattr(v, "dateVente", None) and v.date_vente >= start_month:
        ventes_du_mois.append((c, v))

    def _sum_decimal(lst, f):
      total = Decimal("0")
      for x in lst:
        total += _bd(f(x))
      return total

    total_q_mois = sum(int(c.quantite or 0) for c, _ in ventes_du_mois)
    total_red_mois = _sum_decimal(ventes_du_mois, lambda t: t[0].reduction or 0)
    total_vente_mois = _sum_decimal(
      ventes_du_mois,
      lambda t: (Decimal(str(t[0].prixUnit or 0)) * Decimal(str(t[0].quantite or 0))) - _bd(t[0].reduction or 0),
    )

    ventes_mois_summary = [
      {"nom": "Vente du Mois", "quantite": total_q_mois, "reduction": total_red_mois, "vente": total_vente_mois}]

    total_q = sum(int(c.quantite or 0) for c in toutes)
    total_red = _sum_decimal(toutes, lambda c: c.reduction or 0)
    total_vente = _sum_decimal(
      toutes, lambda c: (Decimal(str(c.prixUnit or 0)) * Decimal(str(c.quantite or 0))) - _bd(c.reduction or 0)
    )
    ventes_total_summary = [{"nom": "Vente Totale", "quantite": total_q, "reduction": total_red, "vente": total_vente}]

    ventes_list = []
    for c in toutes:
      v = self.vente_repo.find_by_id(int(c.vente_id))
      if not v:
        continue
      pu = _bd(c.prix_unit or 0)
      qte = int(c.quantite or 0)
      total = pu * Decimal(qte)
      ventes_list.append({
        "date": getattr(v, "dateVente", None),
        "vendeur": getattr(getattr(v, "employe", None), "user", None) and getattr(v.employe.user, "nom", None),
        "client": getattr(getattr(v, "user", None), "nom", None),
        "prixUnitaire": pu,
        "quantite": qte,
        "prixTotal": total,
        "reduction": _bd(c.reduction or 0),
        "prixVente": total - _bd(c.reduction or 0),
      })

    # COMMANDES
    lcmds = self.produit_cmd_repo.find_by_produit(p)
    commandes_du_mois = []
    for lc in lcmds:
      cmd = self.commande_repo.find_by_id(int(lc.commande_id))
      if cmd and getattr(cmd, "dateCreation", None) and cmd.date_creation >= start_month:
        commandes_du_mois.append(lc)

    def _sum_cmd(lst, field):
      total = Decimal("0")
      for x in lst:
        total += _bd(getattr(x, field, 0) or 0)
      return total

    total_q_cmd_mois = sum(int(getattr(c, "qtiteCmd", 0) or 0) for c in commandes_du_mois)
    total_cout_mois = sum(
      (_bd(getattr(c, "prixPublic", 0)) * _bd(getattr(c, "qtiteCmd", 0))) for c in commandes_du_mois)

    commandes_mois_summary = [{"nom": "Commande du Mois", "quantite": total_q_cmd_mois, "cout": total_cout_mois}]

    total_q_cmd = sum(int(getattr(c, "qtiteCmd", 0) or 0) for c in lcmds)
    total_cout = sum((_bd(getattr(c, "prixPublic", 0)) * _bd(getattr(c, "qtiteCmd", 0))) for c in lcmds)
    commandes_total_summary = [{"nom": "Commande Totale", "quantite": total_q_cmd, "cout": total_cout}]

    # Récap commandes détaillées (commandePriceTotalRecu / Commande)
    commande_price_total_recu = 0
    commande_price_total_commande = 0
    commandes_list = []
    for lc in lcmds:
      cmd = self.commande_repo.find_by_id(int(lc.commande_id))
      if not cmd:
        continue
      pa = _bd(getattr(lc, "puCmd", 0))
      pv = _bd(getattr(lc, "prixPublic", 0))
      qc = int(getattr(lc, "qtiteCmd", 0) or 0)
      qr = int(getattr(lc, "qtiteRecu", 0) or 0)
      tot_cmd = pa * Decimal(qc)
      tot_rec = pa * Decimal(qr)
      commande_price_total_commande += int(tot_cmd)
      commande_price_total_recu += int(tot_rec)
      commandes_list.append({
        "date": getattr(cmd, "dateCreation", None),
        "produitId": p.id,
        "commandeId": cmd.id,
        "fournisseur": getattr(getattr(cmd, "fournisseur", None), "nom", None),
        "prixAchat": pa,
        "prixVente": pv,
        "quantiteCommandee": qc,
        "quantiteRecue": qr,
        "totalCommandee": tot_cmd,
        "totalRecu": tot_rec,
        "etat": getattr(cmd, "etat", None),
      })

    # STOCK
    entrees = self.enrayon_repo.find_all_by_produit_id_and_supprimer(p.id, 0)
    quantite_stock_total = sum(int(getattr(e, "quantite", 0) or 0) for e in entrees)
    stock_summary = {"totalCommandeValue": total_cout, "stockTotalQuantity": quantite_stock_total}
    stock_entries = [{
      "rayonId": getattr(e, "id", None),
      "id": p.id,
      "nom": p.nom,
      "supprimer": p.supprimer or 0,
      "fournisseurId": getattr(getattr(e, "fournisseur", None), "id", None),
      "nomFournisseur": getattr(getattr(e, "fournisseur", None), "nom", None),
      "codeFournisseur": getattr(getattr(e, "fournisseur", None), "code", None),
      "dateLivraison": getattr(e, "dateLivraison", None),
      "datePeremption": getattr(e, "datePeremption", None),
      "prixAchat": _bd(getattr(e, "prixAchat", 0)),
      "prixVente": _bd(getattr(e, "prixVente", 0)),
      "reduction": _bd(getattr(e, "reduction", 0)),
      "quantiteRecu": int(getattr(e, "quantite", 0) or 0),
      "quantiteStock": int(getattr(e, "quantiteRestante", 0) or 0),
    } for e in entrees]

    stock_sorties = []
    for c in toutes:
      v = self.vente_repo.find_by_id(int(c.vente_id))
      stock_sorties.append({
        "nom": p.nom,
        "quantite": int(c.quantite or 0),
        "detail": f"Vente #{getattr(v, 'id', None)}",
        "forme": "Vente",
        "dateOperation": getattr(v, "dateVente", None),
        "operation": "SORTIE_VENTE",
      })

    return {
      "ventesMois": ventes_mois_summary,
      "ventesTotal": ventes_total_summary,
      "ventesList": ventes_list,
      "commandePriceTotalRecu": commande_price_total_recu,
      "commandePriceTotalCommande": commande_price_total_commande,
      "commandesMois": commandes_mois_summary,
      "commandesTotal": commandes_total_summary,
      "commandesList": commandes_list,
      "stockSummary": stock_summary,
      "stockEntries": stock_entries,
      "stockSorties": stock_sorties,
    }

  # ----------------------------------------------------------------------
  # refreshStockProduct()
  # ----------------------------------------------------------------------
  def refresh_stock_product(self) -> None:
    produits = self.produit_repo.find_all()
    for p in produits:
      enrayons = self.enrayon_repo.find_all_by_produit_id_and_supprimer(p.id)
      total = sum(int(getattr(er, "quantiteRestante", 0) or 0) for er in enrayons)
      p.stock = total
      self.produit_repo.save(p)

  # ----------------------------------------------------------------------
  # Mappers privés (DTO)
  # ----------------------------------------------------------------------
  def _map_to_produit_response_dto(self, p) -> Dict[str, Any]:
    # Stock details (uniquement ER > 0)
    ers = self.enrayon_repo.find_all_by_produit_id_and_supprimer(p.id)
    stock_details = []
    total_q = 0
    for er in ers:
      if int(er.quantite or 0) > 0:
        total_q += int(er.quantite or 0)
        stock_details.append({
          "enRayonId": getattr(er, "id", None),
          "productNom": "er.produit?.nom!!",
          "depotNom": "er.produit!!.nom",
          "rayonNom": getattr(getattr(er, "rayon", None), "nom", None),
          "quantite": int(er.quantite or 0),
          "datePeremption": getattr(er, "datePeremption", None),
          "numeroLot": "",
        })

    return {
      "id": p.id,
      "nom": p.nom,
      "description": "",
      "codebarre": "",
      "image": "",
      "supprimer": p.supprimer or 0,
      "seuil": p.stock_min,
      "categorieNom": getattr(getattr(p, "categorie", None), "nom", None),
      "tva": float("0.20"),
      "prixAchatInitial": float("0"),
      "margeBeneficiaire": float("0"),
      "prixVenteConseille": float("0"),
      "prixVenteActuel": float("0"),
      "quantiteTotaleEnStock": total_q,
      "dateCreation": None,
      "dateModification": None,
      "stockDetails": stock_details,
      "uniteMesure": getattr(getattr(p, "forme", None), "nom", "") or "",
    }

  def _map_to_produit_response_map(self, p) -> Dict[str, Any]:
    # ers = self.enrayon_repo.find_all_by_produit_id_and_supprimer(p.id)
    ers = self.produit_detail_repo.find_grossiste_by_produit_id(p.id)
    print(ers)
    print("ers")
    stock_details = [{
      "reference": getattr(er, "reference", None),
      "productNom": getattr(er, "nom", None),
      "prix": getattr(er, "prix", None),
      "rayonNom": getattr(getattr(er, "rayon", None), "nom", None),
      "quantite": int(er.stock or 0)
    } for er in ers if int(er.stock or 0) > 0]

    produit_detail = None
    contenu_detail = p.contenu_detail
    prix_detail = p.prix_detail
    if getattr(p, "detailId", None):
      produit_detail = self.produit_detail_repo.find_by_id(int(p.detailId))

    total_q = sum(int(x["quantite"]) for x in stock_details) if stock_details else 0
    fab = getattr(p, "fabriquant", None)
    return {
      "id": p.id,
      "nom": p.nom,
      "ean13": p.ean13,
      "supprimer": p.supprimer or 0,
      "codeLaborex": p.code_laborex or "",
      "codeUbipharm": p.code_ubipharm or "",
      "reference": p.reference or "",
      "description": "",
      "codebarre": "",
      "image": "",
      "seuil": p.stock_min or 0,
      "categorieId": getattr(getattr(p, "categorie", None), "id", 0),
      "categorieNom": getattr(getattr(p, "categorie", None), "nom", None),

      "rayonId": getattr(getattr(p, "rayon", None), "id", 0),
      "rayonNom": getattr(getattr(p, "rayon", None), "nom", None),

      "etagere": getattr(p, "etagere", None),

      "fabriquantNom": getattr(getattr(p, "fabriquant", None), "nom", None),
      "fabriquantId": getattr(getattr(p, "fabriquant", None), "id", 0),

      "magasinNom": getattr(getattr(p, "magasin", None), "nom", None),
      "magasinId": getattr(getattr(p, "magasin", None), "id", 0),

      "formeNom": getattr(getattr(p, "forme", None), "nom", None),
      "formeId": getattr(getattr(p, "forme", None), "id", 0),
      "tva": Decimal("0.20"),
      "prixAchatInitial": Decimal("0"),
      "margeBeneficiaire": Decimal("0"),
      "prixVenteConseille": Decimal("0"),
      "prixVenteActuel": Decimal("0"),
      "quantiteTotaleEnStock": total_q,
      "produitDetail": getattr(produit_detail, "nom", None),
      "contenuDetail": contenu_detail or 0,
      "prixDetail": prix_detail or 0,
      "stock": p.stock or 0,
      "stockMin": p.stock_min or 0,
      "stockMax": p.stock_max or 0,
      "reductionMax": p.reduction_max or 0,
      "stockDetails": stock_details,
    }

  def search(self, query: str, k: int = 10):
    ids = semantic_search(query, top_k=k)
    if not ids:
      return []
    return (self.db.query(Produit)
            .filter(Produit.id.in_(ids))
            .all())

  def find_all_sellable_ids_and_names(
    self, search: Optional[str] = None, limit: int = 50, offset: int = 0
  ) -> List[Dict]:
    return self.produit_repo.find_all_sellable_ids_and_names(search, limit, offset)

  def find_all_sellable_ids_and_names_by_stock(
    self, search: Optional[str] = None, limit: int = 50, offset: int = 0, min_stock: int = 1
  ) -> List[Dict]:
    return self.produit_repo.find_all_sellable_ids_and_names_by_stock(search, limit, offset, min_stock)
