# services/inventaire_service.py
from __future__ import annotations
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc

from app.models.employe import Employe
from app.models.inventaire import Inventaire
from app.models.produit_inventaire import ProduitInventaire
from app.repositories.categorie_repository import CategorieRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.fabriquant_repository import FabriquantRepository
from app.repositories.forme_repository import FormeRepository
from app.repositories.fournisseur_repository import FournisseurRepository
from app.repositories.inventaire_repository import InventaireRepository
from app.repositories.produit_inventaire_repository import ProduitInventaireRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.rayon_repository import RayonRepository
from app.schemas.inventaire_dto import InventaireRequestDto, InventaireUpdateRequestDto, InventaireNewCreatetDto, \
  InventaireOneProductUpdateRequestDto
from app.utility.user_utils import UserUtils


# Hypothèses de modèles SQLAlchemy (adapte à ton schéma réel)
# - Inventaire: id, etat, date_debut, date_fin, commentaire, employe, rayon, categorie, fabriquant, forme, fournisseur, supprimer
# - ProduitInventaire: id, inventaire_id, en_rayon_id, employe_id, stock_valide, stock_avant, statut, date_debut, date_fin, type, en_rayon(FK)
# - EnRayon: id(str), produit_id, prix_achat, prix_vente, date_livraison, date_peremption, quantite, quantite_restante
# - Produit: id, nom

# DTOs (déjà fournis précédemment)


# --- Helpers --------------------------------------------------------------

def _now() -> datetime:
  return datetime.now()


def _order_by(model, sort_by: str, direction: str):
  col = getattr(model, sort_by, getattr(model, "id"))
  return desc(col) if direction.lower() == "desc" else asc(col)


# --- Service --------------------------------------------------------------

class InventaireService:
  """
  Port Python de InventaireService.kt (Spring) → logique identique.
  Les repositories Spring sont remplacés par l'usage direct de SQLAlchemy + quelques helpers.
  """

  # Les dépendances ci-dessous miment les repositories Spring injectés dans le Kotlin
  def __init__(
    self,
    db: Session,
  ):
    self.db = db
    self.user_utils = UserUtils
    self.enrayon_repo = EnRayonRepository(db)
    self.employe_repo = EmployeRepository(db)
    self.inventaire_repo = InventaireRepository(db)
    self.produit_inventorie_repo = ProduitInventaireRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.rayon_repo = RayonRepository(db)
    self.categorie_repo = CategorieRepository(db)
    self.fabriquant_repo = FabriquantRepository(db)
    self.forme_repo = FormeRepository(db)
    self.fournisseur_repo = FournisseurRepository(db)

    # Constantes d'état (utilisées par le Kotlin sur l'entité Inventaire)
    # Utilise celles de ton modèle si elles existent déjà.
    self.INVENTAIRE_EN_COURS = getattr(Inventaire, "INVENTAIRE_EN_COURS", "en_cours")
    self.INVENTAIRE_CLOTURER = getattr(Inventaire, "INVENTAIRE_CLOTURER", "cloturer")
    self.INVENTAIRE_TERMINER = getattr(Inventaire, "INVENTAIRE_TERMINER", "terminer")

  # ------------------------------------------------------------------
  # creerInventaire(data)
  # ------------------------------------------------------------------
  def creer_inventaire(self, data: InventaireRequestDto, currentEmploye: Employe) -> Inventaire:
    employe = currentEmploye
    inv = Inventaire(
      date_debut=_now(),
      etat=self.INVENTAIRE_EN_COURS,
    )
    self.db.add(inv)
    self.db.commit()
    self.db.refresh(inv)

    for produit in data.produitList:
      en_rayon = self.enrayon_repo.find_by_id(str(produit.rayonId))
      if not en_rayon:
        raise HTTPException(status_code=404, detail=f"Rayon introuvable avec l'ID: {produit.rayonId}")
      pi = ProduitInventaire(
        inventaire_id=inv.id,
        en_rayon_id=en_rayon.id,
        employe_id=getattr(employe, "id", None),
        stock_valide=produit.quantiteReel,
        stock_avant=produit.quantiteSysteme,
      )
      self.db.add(pi)

    self.db.commit()
    return inv

  # ------------------------------------------------------------------
  # creerInventaireNew(data)
  # ------------------------------------------------------------------
  def creer_inventaire_new(self, data: InventaireNewCreatetDto, currentEmploye: Employe) -> Dict[str, Any]:
    employe = currentEmploye

    rayon = self.rayon_repo.find_by_id(int(data.rayonId)) if data.rayonId else None
    categorie = self.categorie_repo.find_by_id(int(data.categorieId)) if data.categorieId else None
    fabriquant = self.fabriquant_repo.find_by_id(int(data.fabriquantId)) if data.fabriquantId else None
    forme = self.forme_repo.find_by_id(int(data.formeId)) if data.formeId else None
    fournisseur = self.fournisseur_repo.find_by_id(int(data.fournisseurId)) if data.fournisseurId else None

    inv = Inventaire(
      rayon_id=rayon.id if rayon else None,
      categorie_id=categorie.id if categorie else None,
      fabriquant_id=fabriquant.id if fabriquant else None,
      forme_id=forme.id if forme else None,
      fournisseur_id=fournisseur.id if fournisseur else None,
      employe_id=employe.id,
      supprimer=0,
      commentaire="",
      date_debut=_now(),
      date_fin=None,
      etat=self.INVENTAIRE_EN_COURS,
    )
    self.db.add(inv)
    self.db.commit()
    self.db.refresh(inv)
    return {
      "id": inv.id,
      "etat": inv.etat,
      "supprimer": inv.supprimer,
      "date_debut": inv.date_debut,
      "date_fin": inv.date_fin,
      "employe_id": inv.employe_id,
      "rayon_id": inv.rayon_id,
      "categorie_id": inv.categorie_id,
      "fabriquant_id": inv.fabriquant_id,
      "forme_id": inv.forme_id,
      "fournisseur_id": inv.fournisseur_id,
      "commentaire": inv.commentaire,
    }

  # ------------------------------------------------------------------
  # cloturerInventaire(inventaireId)
  # ------------------------------------------------------------------
  def cloturer_inventaire(self, inventaire_id: int) -> Inventaire:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable avec l'ID: {inventaire_id}")
    inv.etat = "cloturer"  # conforme au Kotlin
    # inv.date_fin = _now()  # (commenté dans le Kotlin)
    self.db.commit()
    self.db.refresh(inv)
    return inv

  # ------------------------------------------------------------------
  # mettreAJourInventaire(data)
  # ------------------------------------------------------------------
  def mettre_a_jour_inventaire(self, data: InventaireUpdateRequestDto, currentEmploye: Employe) -> Inventaire:
    inv = self.inventaire_repo.find_by_id(int(data.id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable: {data.id}")
    employe = currentEmploye

    for p in data.produitList:
      en_rayon = self.enrayon_repo.find_by_id(str(p.rayonId))
      if not en_rayon:
        raise HTTPException(status_code=404, detail=f"EnRayon introuvable: {p.rayonId}")

      existing = self.produit_inventorie_repo.find_by_inventaire_and_en_rayon(inv, en_rayon)
      if existing:
        existing.stock_valide = p.quantiteReel
        existing.stock_avant = p.quantiteSysteme
        existing.employe_id = getattr(employe, "id", None)
        self.db.add(existing)
      else:
        new_pi = ProduitInventaire(
          inventaire_id=inv.id,
          en_rayon_id=en_rayon.id,
          employe_id=getattr(employe, "id", None),
          stock_valide=p.quantiteReel,
          stock_avant=p.quantiteSysteme,
          statut=self.INVENTAIRE_EN_COURS,
          date_debut=_now(),
        )
        self.db.add(new_pi)

    self.db.commit()
    self.db.refresh(inv)
    return inv

  # ------------------------------------------------------------------
  # valideProductToInventory(data)
  # ------------------------------------------------------------------
  def valide_product_to_inventory(self, data: InventaireOneProductUpdateRequestDto,
                                  currentEmploye: Employe) -> ProduitInventaire:
    inv = self.inventaire_repo.find_by_id(int(data.id))
    # if not inv:
    #   raise HTTPException(status_code=404, detail=f"Inventaire introuvable: {data.id}")
    employe = currentEmploye
    en_rayon = self.enrayon_repo.find_by_id(str(data.rayonId))
    # if not en_rayon:
    #   raise HTTPException(status_code=404, detail=f"EnRayon introuvable: {data.rayonId}")

    pi = self.produit_inventorie_repo.find_by_inventaire_and_en_rayon(inv, en_rayon)
    now = _now()

    if pi:
      if pi.statut == self.INVENTAIRE_CLOTURER:
        # repasse en "en cours"
        pi.employe_id = getattr(employe, "id", None)
        pi.statut = self.INVENTAIRE_EN_COURS
        pi.date_fin = now
      elif pi.statut == self.INVENTAIRE_EN_COURS:
        # clôture avec valeurs reçues
        pi.employe_id = getattr(employe, "id", None)
        pi.stock_valide = data.quantiteReel
        pi.stock_avant = data.quantiteSysteme
        pi.statut = self.INVENTAIRE_CLOTURER
        pi.date_fin = now
      else:
        # état inconnu → clôture directe
        pi.employe_id = getattr(employe, "id", None)
        pi.stock_valide = data.quantiteReel
        pi.stock_avant = data.quantiteSysteme
        pi.statut = self.INVENTAIRE_CLOTURER
        pi.date_fin = now
        pi.date_debut = now
      self.db.add(pi)
    else:
      pi = ProduitInventaire(
        inventaire_id=inv.id,
        en_rayon_id=en_rayon.id,
        employe_id=getattr(employe, "id", None),
        stock_valide=data.quantiteReel,
        stock_avant=data.quantiteSysteme,
        statut=self.INVENTAIRE_CLOTURER,
        date_debut=now,
        date_fin=now,
      )
      self.db.add(pi)

    self.db.commit()
    self.db.refresh(pi)
    return pi

  # ------------------------------------------------------------------
  # invalideProductToInventory(id)
  # ------------------------------------------------------------------
  def invalide_product_to_inventory(self, id_: str) -> Dict[str, Any]:
    pi = self.produit_inventorie_repo.find_by_id(int(id_))
    if not pi:
      raise HTTPException(status_code=404, detail="ProduitInventaire introuvable")
    self.db.delete(pi)
    self.db.commit()
    return {"message": "Inventaire supprimé avec succès"}

  # ------------------------------------------------------------------
  # listerInventaires(page,size,sort,direction)
  # ------------------------------------------------------------------
  def lister_inventaires(self, page: int, size: int, sort: str, direction: str) -> Dict[str, Any]:
    q = self.db.query(Inventaire).order_by(_order_by(Inventaire, sort, direction))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return {
      "content": rows,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
      "sortBy": sort,
      "sortDir": direction.upper(),
    }

  # ------------------------------------------------------------------
  # listerInventairesCustom(pageable) -> Page<Map<String,Any?>>
  # ------------------------------------------------------------------
  def lister_inventaires_custom(self, page: int, size: int, sort: str, direction: str) -> Dict[str, Any]:
    q = self.db.query(Inventaire).order_by(_order_by(Inventaire, sort, direction))
    total = q.count()
    rows: List[Inventaire] = q.offset(page * size).limit(size).all()

    def _compute(inv: Inventaire) -> Dict[str, Any]:
      produits = self.produit_inventorie_repo.find_by_inventaire(inv)
      total_prod = 0
      total_prod_excedent = 0
      total_prod_manquant = 0
      total_prod_ecart = 0

      total_price = 0
      total_price_excedent = 0
      total_price_manquant = 0
      total_price_neutre = 0
      total_price_ecart = 0

      for p in produits:
        sa = int(p.stock_avant or 0)
        sv = int(p.stock_valide or 0)
        prix_achat = int(getattr(getattr(p, "en_rayon", None), "prix_achat", 0) or 0)

        if sa == sv:
          pass
        elif sa > sv:
          total_prod_manquant += (sv - sa)
          total_price_manquant += prix_achat * (sv - sa)
        else:
          total_prod_excedent += -(sv - sa)
          total_price_excedent += prix_achat * -(sv - sa)

        total_prod += total_prod_excedent - total_prod_manquant
        total_price_neutre = total_price_manquant + total_price_excedent

      total_price_ecart = -total_price_manquant + total_price_excedent
      total_prod_ecart = total_prod_manquant + total_prod_excedent

      return {
        "id": inv.id,
        "etat": inv.etat,
        "dateDebut": inv.date_debut,
        "dateFin": inv.date_fin,
        "employe": getattr(getattr(inv, "employe", None), "user", None) and getattr(inv.employe.user, "username", None),
        "rayon": getattr(getattr(inv, "rayon", None), "nom", None),
        "categorie": getattr(getattr(inv, "categorie", None), "nom", None),
        "fabriquant": getattr(getattr(inv, "fabriquant", None), "nom", None),
        "forme": getattr(getattr(inv, "forme", None), "nom", None),
        "fournisseur": getattr(getattr(inv, "fournisseur", None), "nom", None),
        "commentaire": getattr(inv, "commentaire", None),
        "totalProduitsManquant": total_prod_manquant,
        "totalProduitsExcedent": total_prod_excedent,
        "totalProduitsEcart": total_prod_ecart,
      }

    content = [_compute(inv) for inv in rows]
    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageable": {
        "pageSize": size,
      },
      "pageNumber": page,
    }

  # ------------------------------------------------------------------
  # listerProduitsParInventaire(inventaireId, pageable)
  # ------------------------------------------------------------------
  def lister_produits_par_inventaire(self, inventaire_id: int, page: int, size: int, sort: str, direction: str) -> Dict[
    str, Any]:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable avec l'ID: {inventaire_id}")

    q = self.db.query(ProduitInventaire).filter(ProduitInventaire.inventaire_id == inv.id).order_by(
      _order_by(ProduitInventaire, sort, direction))
    total = q.count()
    rows = q.offset(page * size).limit(size).all()
    return {
      "content": rows,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageNumber": page,
    }

  # ------------------------------------------------------------------
  # listerProduitsParInventaireAsMap(search, inventaireId, pageable)
  # ------------------------------------------------------------------
  def lister_produits_par_inventaire_as_map(
    self, search: Optional[str], inventaire_id: str, page: int, size: int, sort: str, direction: str
  ) -> Dict[str, Any]:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable avec l'ID: {inventaire_id}")

    if search:
      prod_ids = [p.id for p in self.produit_repo.find_by_nom_containing(search)]
      enrayons = self.enrayon_repo.find_all_by_produit_id_in_and_supprimer(prod_ids)
      ids = [e.id for e in enrayons]
      base_q = self.db.query(ProduitInventaire).filter(
        ProduitInventaire.inventaire_id == inv.id,
        ProduitInventaire.en_rayon_id.in_(ids)
      )
    else:
      base_q = self.db.query(ProduitInventaire).filter(
        ProduitInventaire.inventaire_id == inv.id
      )

    q = base_q.order_by(_order_by(ProduitInventaire, sort, direction))
    total = q.count()
    rows: List[ProduitInventaire] = q.offset(page * size).limit(size).all()

    def _active(statut: str) -> bool:
      if statut == self.INVENTAIRE_EN_COURS:
        return True
      if statut == self.INVENTAIRE_CLOTURER:
        return False
      return True

    content = []
    for p in rows:
      # produitData est le produit rattaché au EnRayon
      produit_data = self.produit_repo.find_by_id(getattr(p.en_rayon, "produit_id"))
      content.append({
        "produitInventaireId": p.id,
        "id": getattr(produit_data, "id", None),
        "rayonId": getattr(p.en_rayon, "id", None),
        "rayon": p.en_rayon,
        "dateLivraison": getattr(p.en_rayon, "date_livraison", None),
        "datePeremption": getattr(p.en_rayon, "date_peremption", None),
        "type": getattr(p, "type", None),
        "nom": getattr(produit_data, "nom", None),
        "isActive": _active(p.statut),
        "quantiteSysteme": p.stock_avant,
        "quantiteReelle": p.stock_valide,
        "comparaison": (int(p.stock_avant or 0) - int(p.stock_valide or 0)),
      })

    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageNumber": page,
    }

  # ------------------------------------------------------------------
  # getInfoProduitsInventaire(inventaireId)
  # ------------------------------------------------------------------
  def get_info_produits_inventaire(self, inventaire_id: str) -> Dict[str, Any]:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable: {inventaire_id}")
    produits = self.produit_inventorie_repo.find_by_inventaire(inv)

    total_prod = 0
    total_prod_excedent = 0
    total_prod_manquant = 0
    total_prod_neutre = 0
    total_prod_ecart = 0

    total_price = 0
    total_price_excedent = 0
    total_price_manquant = 0
    total_price_neutre = 0
    total_price_ecart = 0

    for p in produits:
      sa = int(p.stock_avant or 0)
      sv = int(p.stock_valide or 0)
      prix_achat = int(getattr(getattr(p, "en_rayon", None), "prix_achat", 0) or 0)

      if sa == sv:
        pass
      elif sa > sv:
        total_prod_manquant += (sv - sa)
        total_price_manquant += prix_achat * (sv - sa)
      else:
        total_prod_excedent += -(sv - sa)
        total_price_excedent += prix_achat * -(sv - sa)

      total_prod += total_prod_excedent - total_prod_manquant
      total_price_neutre = total_price_manquant + total_price_excedent

    total_price_ecart = -total_price_manquant + total_price_excedent
    total_prod_ecart = total_prod_manquant + total_prod_excedent

    return {
      "totalProduits": total_prod,
      "totalProduitsExcedent": total_prod_excedent,
      "totalProduitsManquant": total_prod_manquant,
      "totalProduitsNeutre": total_prod_neutre,
      "totalProduitsEcart": -total_prod_ecart,
      "totalProduitsPrice": total_price,
      "totalProduitsPriceExcedent": total_price_excedent,
      "totalProduitsPriceManquant": total_price_manquant,
      "totalProduitsPriceNeutre": total_price_neutre,
      "totalProduitsPriceEcart": -total_price_ecart,
    }

  # ------------------------------------------------------------------
  # listerProduitsParInventaireAvecFiltre(inventaireId, pageable, filtre)
  # ------------------------------------------------------------------
  def lister_produits_par_inventaire_avec_filtre(
    self, inventaire_id: str, page: int, size: int, sort: str, direction: str, filtre: Optional[str] = None
  ) -> Dict[str, Any]:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable avec l'ID: {inventaire_id}")

    q = self.db.query(ProduitInventaire).filter(ProduitInventaire.inventaire_id == inv.id).order_by(
      _order_by(ProduitInventaire, sort, direction))
    all_rows: List[ProduitInventaire] = q.all()

    def _keep(p: ProduitInventaire) -> bool:
      sa = int(p.stock_avant or 0);
      sv = int(p.stock_valide or 0)
      if filtre == "equal":   return sa == sv
      if filtre == "greater": return sa > sv
      if filtre == "less":    return sa < sv
      return True

    filtered = [p for p in all_rows if _keep(p)]
    total = len(filtered)
    print("filtered")
    print(filtered)
    print("total")
    print(total)
    rows = filtered[page * size:(page + 1) * size]

    def _active(statut: str) -> bool:
      if statut == self.INVENTAIRE_EN_COURS: return True
      if statut == self.INVENTAIRE_CLOTURER: return False
      return True

    content = []
    for p in rows:
      produit_data = self.produit_repo.find_by_id(getattr(p.en_rayon, "produit_id"))
      content.append({
        "produitInventaireId": p.id,
        "id": getattr(produit_data, "id", None),
        "rayonId": getattr(p.en_rayon, "id", None),
        "rayon": p.en_rayon,
        "dateLivraison": getattr(p.en_rayon, "date_livraison", None),
        "datePeremption": getattr(p.en_rayon, "date_peremption", None),
        "type": getattr(p, "type", None),
        "nom": getattr(produit_data, "nom", None),
        "isActive": _active(p.statut),
        "quantiteSysteme": p.stock_avant,
        "quantiteReelle": p.stock_valide,
        "comparaison": (int(p.stock_avant or 0) - int(p.stock_valide or 0)),
      })

    return {
      "content": content,
      "totalElements": total,
      "totalPages": (total + size - 1) // size if size else 1,
      "pageSize": size,
      "pageNumber": page,
    }

  # ------------------------------------------------------------------
  # terminerInventaire(inventaireId, commentaire)
  # ------------------------------------------------------------------
  def terminer_inventaire(self, inventaire_id: int, commentaire: str) -> Inventaire:
    inv = self.inventaire_repo.find_by_id(int(inventaire_id))
    if not inv:
      raise HTTPException(status_code=404, detail=f"Inventaire introuvable avec l'ID: {inventaire_id}")

    inv.etat = self.INVENTAIRE_TERMINER
    inv.commentaire = commentaire
    inv.date_fin = _now()
    self.db.commit()
    self.db.refresh(inv)
    return inv
