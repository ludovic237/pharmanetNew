from datetime import datetime, time, date
from typing import Optional, List, Dict, Any

from fastapi_pagination import paginate, Params
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException

from app.core.pagination import Page
from app.models.caisse import Caisse
from app.models.employe import Employe
from app.repositories.bon_caisse_repository import BonCaisseRepository
from app.repositories.caisse_repository import CaisseRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.repositories.depense_repository import DepenseRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.facturation_repository import FacturationRepository
from app.repositories.facture_electronique_repository import FactureElectroniqueRepository
from app.repositories.facture_espece_repository import FactureEspeceRepository
from app.repositories.facture_ticket_repository import FactureTicketRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.produit_retour_repository import ProduitRetourRepository
from app.repositories.retour_produit_repository import RetourProduitRepository
from app.repositories.vente_repository import VenteRepository
from app.schemas.caisse_dto import CaisseOuvertureRequestDto, CaisseDto
from app.utility.user_utils import UserUtils
from fastapi_pagination.ext.sqlalchemy import paginate as sa_paginate


class CaisseService:

  def __init__(self, db: Session, ):
    self.db = db
    self.user_utils = UserUtils
    # repos est un dict contenant tous les repositories
    self.caisse_repo = CaisseRepository(db)
    self.retour_produit_repo = RetourProduitRepository(db)
    self.boncaisse_repo = BonCaisseRepository(db)
    self.retour_repo = RetourProduitRepository(db)
    self.depense_repo = DepenseRepository(db)
    self.vente_repo = VenteRepository(db)
    self.employe_repo = EmployeRepository(db)
    self.produit_retour_repo = ProduitRetourRepository(db)
    self.concerner_repo = ConcernerRepository(db)
    self.facturation_repo = FacturationRepository(db)
    self.facture_espece_repo = FactureEspeceRepository(db)
    self.facture_ticket_repo = FactureTicketRepository(db)
    self.facture_elec_repo = FactureElectroniqueRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.produit_detail_repo = ProduitDetailRepository(db)

  # === Vérifications d'état ===
  def is_caisse_ouverte(self) -> bool:
    return self.db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).count() > 0

  def get_last_caisse(self):
    return self.db.query(Caisse).order_by(Caisse.id.desc()).first()

  def get_caisse_active(self):
    return self.db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).first()
    # return self.caisse_repo.find_by_etat_and_supprimer_first(etat=etat, supprimer=0)
    # return db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).first()

  def get_caisse_active_db(db: Session):
    return db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).first()

  # def get_caisse_active_db(db: Session):
  #   return db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).first()

  def get_caisse_fermer(db: Session):
    return db.query(Caisse).filter(Caisse.etat == "Clot", Caisse.supprimer == 0).first()

  def get_caisse_en_cours(self):
    return self.db.query(Caisse).filter(Caisse.etat == "En cours", Caisse.supprimer == 0).first()

  def get_caisse_attente_cloture(self):
    return self.db.query(Caisse).filter(Caisse.etat == "En cours1", Caisse.supprimer == 0).first()

  # === Ouvrir une caisse ===
  def ouvrir_caisse(self, request: CaisseOuvertureRequestDto, currentEmploye: Employe) -> CaisseDto:
    employe = currentEmploye
    if not employe:
      raise HTTPException(status_code=400, detail="Impossible de récupérer l’utilisateur connecté")

    active = self.get_caisse_en_cours()
    if active:
      raise HTTPException(status_code=400, detail=f"Caisse déjà ouverte ID {active.id}, Session {active.session}")

    caisse = Caisse(
      user_id=employe.id,
      fond_caisse_ouvert=float(request.fond_caisse_ouvert),
      ouverture_caisse=request.ouverture_caisse,
      date_ouvert=datetime.now(),
      session=self.generer_session_id(),
      etat="Ouvert",
      supprimer=0
    )
    self.db.add(caisse)
    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)

  # === Fermer une caisse ===
  def cloturer_caisse(self, fond_caisse_ferme: float, fermeture_caisse: str, currentEmploye: Employe) -> CaisseDto:
    employe_id = currentEmploye.id
    caisse = self.get_caisse_en_cours()
    if not caisse or caisse.user_id != employe_id:
      raise HTTPException(status_code=403, detail="Non autorisé à fermer cette caisse")

    caisse.fermeture_caisse = fermeture_caisse
    caisse.fond_caisse_ferme = fond_caisse_ferme
    caisse.date_ferme = datetime.now()
    caisse.etat = "Clot"

    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)

  # === Mettre caisse en attente ===
  def mettre_caisse_en_attente(self, currentEmploye: Employe) -> CaisseDto:
    employe_id = currentEmploye.id
    service = CaisseService(self.db)
    caisse = service.get_caisse_active()
    if caisse and caisse.user_id == employe_id:
      caisse.etat = "En cours"
      self.db.commit()
      self.db.refresh(caisse)
      return self.map_to_dto(caisse)
    raise HTTPException(status_code=403, detail="Non autorisé ou aucune caisse trouvée")

  # === Ouvrir une nouvelle caisse ===
  def ouvrir_nouvelle_caisse(self, request: CaisseOuvertureRequestDto, currentEmploye: Employe) -> CaisseDto:
    employe = currentEmploye
    active = self.caisse_repo.find_by_etat_and_supprimer_first(etat="Ouvert", supprimer=0)
    en_cours = self.db.query(Caisse).filter(
      Caisse.user_id == employe.id, Caisse.etat == "En cours", Caisse.supprimer == 0
    ).first()
    if active or en_cours:
      raise HTTPException(status_code=400, detail="Impossible d’ouvrir une nouvelle caisse")

    caisse = Caisse(
      user_id=employe.id,
      fond_caisse_ouvert=float(request.fondCaisseOuvert or 0),
      ouverture_caisse=request.ouvertureCaisse or "",
      date_ouvert=datetime.now(),
      session=self.generer_session_id(),
      etat="Ouvert",
      supprimer=0
    )
    self.db.add(caisse)
    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)

  # === Méthodes utilitaires ===
  def generer_session_id(self) -> str:
    heure = datetime.now().time()
    if time(5, 0) <= heure <= time(11, 59):
      return "matin"
    elif time(12, 0) <= heure <= time(23, 59):
      return "soir"
    return "soir"

  def map_to_dto(self, caisse: Caisse) -> CaisseDto:
    return CaisseDto(
      id=caisse.id,
      employeId=caisse.user_id,
      nomEmploye=f"{caisse.user.user.prenom if caisse.user else ''} {caisse.user.user.nom if caisse.user else ''}".strip(),
      dateOuvert=caisse.date_ouvert,
      dateFerme=caisse.date_ferme,
      session=caisse.session,
      fondCaisseOuvert=caisse.fond_caisse_ouvert,
      fondCaisseFerme=caisse.fond_caisse_ferme,
      etat=caisse.etat
    )

    # ----------------------------
    # Récupérer toutes les caisses (avec pagination)
    # ----------------------------

  def get_all_caisses(self, page: int = 0,
                      size: int = 10,
                      start_date: Optional[str] = None,
                      end_date: Optional[str] = None,
                      ) -> Dict[str, Any]:
    query = self.db.query(Caisse).order_by(Caisse.date_ouvert.desc())
    if start_date == 'null':
      start_date = None
    if end_date == 'null':
      end_date = None
    if start_date is not None and end_date is not None:
      start_dt = datetime.fromisoformat(start_date.strip())
      end_dt = datetime.fromisoformat(end_date.strip())
      query = self.db.query(Caisse).filter(Caisse.date_ouvert.between(start_dt, end_dt)).order_by(
        Caisse.date_ouvert.desc())
    params = Params(page=page + 1, size=size)
    page_obj = sa_paginate(self.db, query, params)
    # return paginate(query.all())
    content: List[Dict[str, Any]] = []
    for c in page_obj.items:
      content.append(
        {
          "id": c.id,
          "session": c.session,
          "etat": c.etat,
          "dateOuvert": c.date_ouvert,
          "dateFerme": c.date_ferme,
          "fondCaisseFerme": c.fond_caisse_ferme,
          "fondCaisseOuvert": c.fond_caisse_ouvert,
          "nomEmploye": (c.user.user.nom if c.user else "Inconnu"),
          "employe": (c.user.user.nom if c.user else "Inconnu"),
          "dateOuvert": c.date_ouvert,
          "dateFerme": c.date_ferme
        }
        # c
      )

    return {
      "content": content,
      "totalElements": page_obj.total,  # nb total d’éléments (toutes pages)
      "totalPages": page_obj.pages,  # nb total de pages
      "pageSize": page_obj.size,  # taille de page
      "pageable": {
        "pageSize": page_obj.size,
        "totalElements": page_obj.total,  # nb total d’éléments (toutes pages)
        "totalPages": page_obj.pages,  # nb total de pages
        "pageNumber": page_obj.page,  # taille de page
      },
      "pageNumber": page_obj.page,  # page courante (1-based)
    }

  # ----------------------------
  # Filtrer les caisses par critères (id + dates) avec pagination
  # ----------------------------
  def get_filtered_caisses(
    self,
    caisse_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 0,
    size: int = 10
  ) -> Page[Caisse]:
    query = self.db.query(Caisse)

    if caisse_id:
      query = query.filter(Caisse.id == caisse_id)
    if start_date:
      query = query.filter(Caisse.date_ouvert >= start_date)
    if end_date:
      query = query.filter(Caisse.date_ferme <= end_date)

    query = query.order_by(Caisse.date_ouvert.desc())
    return paginate(query.all())

  def set_caisse_to_pending_closure(
    self, currentEmploye: Employe):
    employe_id = currentEmploye.id
    service = CaisseService(self.db)
    caisse = service.get_caisse_active()

    if not caisse:
      raise HTTPException(status_code=404, detail="Aucune caisse active trouvée")

    if caisse.user_id != employe_id:
      raise HTTPException(status_code=403, detail="Vous n’êtes pas autorisé à modifier cette caisse")

    caisse.etat = "En cours1"  # état "attente de clôture"
    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)

    # équivalent de: @Transactional fun generateCaisseReport(caisseId: Long): Map<String, Any?>

  def generate_caisse_report(self, caisse_id: int) -> Dict[str, Any]:
    # ---------- Récup caisse ----------
    caisse = self.caisse_repo.find_by_id(caisse_id)
    caisseData = {
      "id": caisse.id,
      "userId": caisse.user_id,
      "user": caisse.user,
      "ouvertureCaisse": caisse.ouverture_caisse,
      "fermetureCaisse": caisse.fermeture_caisse,
      "dateOuvert": caisse.date_ouvert,
      "dateFerme": caisse.date_ferme,
      "session": caisse.session,
      "fondCaisseOuvert": caisse.fond_caisse_ouvert,
      "fondCaisseFerme": caisse.fond_caisse_ferme,
      "etat": caisse.etat,
      "supprimer": caisse.supprimer,
    }
    if not caisse:
      raise ValueError("Caisse not found")

    prix_total_encaissement_vente = 0
    prix_total_facture_espece = 0
    prix_total_facture_electronique = 0
    prix_total_facture_ticket = 0
    prix_total_facture_rendu = 0.0

    # ---------- Facturations ----------
    facturations = self.facturation_repo.find_by_caisse(caisse.id) or []
    if len(facturations) > 0:
      for facturation in facturations:
        facturation_id = getattr(facturation, "id", None)
        if facturation_id is None:
          continue

        if self.facture_espece_repo.exists_by_facturation_id(facturation_id):
          f = self.facture_espece_repo.find_by_facturation_id(facturation_id)
          prix_total_facture_espece += int(getattr(f, "montant", 0) or 0)

        if self.facture_elec_repo.exists_by_facturation_id(facturation_id):
          f = self.facture_elec_repo.find_by_facturation_id(facturation_id)
          prix_total_facture_electronique += int(getattr(f, "montant", 0) or 0)

        if self.facture_ticket_repo.exists_by_facturation_id(facturation_id):
          f = self.facture_ticket_repo.find_by_facturation_id(facturation_id)
          prix_total_facture_ticket += int(getattr(f, "montant", 0) or 0)

      prix_total_encaissement_vente = (
        prix_total_facture_ticket
        + prix_total_facture_espece
        + prix_total_facture_electronique
      )

    # ---------- Ventes / Bons / Dépenses ----------
    ventes = self.vente_repo.find_by_caisse_id_and_prix_percu_gte(caisse_id, 0.0) or []
    bon_caisse_generes = self.boncaisse_repo.find_generated_by_caisse_id(str(caisse_id)) or []
    bon_caisse_encaisse = self.boncaisse_repo.find_encaisse_by_caisse_id(str(caisse_id)) or []

    depenses = self.depense_repo.find_by_caisse_id(str(caisse_id)) or []
    depenses_map: List[Dict[str, Any]] = [
      {
        "designation": getattr(d, "designation", None),
        "quantite": getattr(d, "quantite", None),
        "prixUnitaire": getattr(d, "prix_unitaire", None),
        "typeDepense": getattr(d, "type_depense", None),
      }
      for d in depenses
    ]

    # ---------- Retours produits ----------
    retour_produits = self.retour_produit_repo.find_by_caisse(caisse) or []
    produit_retour_list = self.produit_retour_repo.find_by_retour_produit_in(retour_produits) or []

    def _produits_noms_for_retour(retour_produit) -> List[str]:
      # retourne la liste des noms des produits d'un retour_produit donné
      prs = self.produit_retour_repo.find_by_retour_produit_id(int(getattr(retour_produit, "id", 0) or 0)) or []
      noms = []
      for pr in prs:
        concerner_id = getattr(getattr(pr, "concerner", None), "id", None)
        if concerner_id is None:
          continue
        concerne = self.concerner_repo.find_by_id(concerner_id)
        if not concerne:
          continue
        en_rayon_id = int(getattr(concerne, "en_rayon_id", 0) or 0)
        if en_rayon_id <= 0:
          continue
        en_rayon = self.enrayon_repo.find_by_id(en_rayon_id)
        if not en_rayon:
          continue
        produit_id = int(getattr(en_rayon, "produit_id", 0) or 0)
        if produit_id <= 0:
          continue
        p = self.produit_repo.find_by_id(produit_id)
        if p:
          noms.append(getattr(p, "nom", None))
      return noms

    retour_produits_map: List[Dict[str, Any]] = []
    for rp in retour_produits:
      produits = _produits_noms_for_retour(rp)
      prs = self.produit_retour_repo.find_by_retour_produit_id(int(getattr(rp, "id", 0) or 0)) or []

      total_qte = sum(int(getattr(x, "quantite", 0) or 0) for x in prs)
      total_montant = 0.0
      for x in prs:
        q = float(getattr(x, "quantite", 0) or 0)
        c = getattr(x, "concerner", None)
        pu = float(getattr(c, "prix_unit", 0) or 0)
        total_montant += q * pu

      retour_produits_map.append(
        {
          "reference": getattr(getattr(rp, "vente", None), "reference", None),
          "produit": produits,
          "quantite": total_qte,
          "total": total_montant,
        }
      )

    # ---------- Agrégats ventes ----------
    list_reduction: List[Dict[str, Any]] = []
    prix_total_vente_reduction = 0.0
    prix_total_vente_credit = 0.0
    prix_total_vente_comptant = 0.0
    prix_total_vente_assurance = 0.0
    prix_total_vente = 0
    prix_total_detail = 0
    prix_total_grossiste = 0
    prix_total_detaillant = 0
    list_vente_credit: List[Dict[str, Any]] = []

    for vente in ventes:
      reduction = float(getattr(vente, "reduction", 0) or 0.0)
      prix_percu = float(getattr(vente, "prix_percu", 0.0) or 0.0)
      prix_total = float(getattr(vente, "prix_total", 0.0) or 0.0)

      if reduction >= 0.0:
        prix_total_facture_rendu = (prix_percu - prix_total) + prix_total_facture_rendu
        prix_total_vente_reduction += reduction
        list_reduction.append(
          {
            "reductionPrixTotal": prix_total,
            "reductionDateVente": getattr(vente, "date_vente", None),
            "reductionReduction": getattr(vente, "reduction", None),
            "reductionReference": getattr(vente, "reference", None),
            "reductionId": getattr(vente, "id", None),
          }
        )

      etat_statut = getattr(vente, "etat", "")
      etat = (UserUtils.remove_accent(input_str=etat_statut, self=self)).upper()

      if etat == "CREDIT":
        list_vente_credit.append(
          {
            "reference": getattr(vente, "reference", None),
            "prixTotal": prix_total,
            "id": getattr(vente, "id", None),
            "prixPercu": prix_percu,
            "dateVente": getattr(vente, "date_vente", None),
            "client": getattr(getattr(vente, "user", None), "nom", None),
          }
        )
        prix_total_vente_credit += prix_total
      elif etat == "COMPTANT":
        prix_total_vente_comptant += prix_total
      elif etat == "ASSURANCE":
        prix_total_vente_assurance += prix_total

      # Lignes de vente (Concerner)
      vente_id = getattr(vente, "id", None)
      if not vente_id:
        continue
      concerner_list = self.concerner_repo.find_by_vente_id(int(vente_id)) or []
      for concerne in concerner_list:
        en_rayon_id = int(getattr(concerne, "en_rayon_id", 0) or 0)
        quantite = int(getattr(concerne, "quantite", 0) or 0)
        prix_unit = int(getattr(concerne, "prix_unit", 0) or 0)

        if en_rayon_id > 1000:
          en_rayon = self.enrayon_repo.find_by_id(en_rayon_id)
          fournisseur_type = self.user_utils.remove_accent(
            input_str=getattr(getattr(en_rayon, "fournisseur", None), "statut", ""),
            self=self
          ).upper()
          if fournisseur_type == "GROSSISTE":
            prix_total_grossiste += prix_unit * quantite
          elif fournisseur_type == "DETAILLANT":
            prix_total_detaillant += prix_unit * quantite
          else:
            prix_total_detail += prix_unit * quantite
        else:
          # produit_detail
          _ = self.produit_detail_repo.find_by_id(int(en_rayon_id))
          prix_total_detail += prix_unit * quantite

    prix_total_vente = prix_total_detail + prix_total_detaillant + prix_total_grossiste

    def _sum_if(ventes_list: List[Any], etat_str: str) -> float:
      target = etat_str.upper()
      total = 0.0
      for v in ventes_list:
        if UserUtils.remove_accent(input_str=getattr(v, "etat", ""), self=self).upper() == target:
          total += float(getattr(v, "prix_total", 0.0) or 0.0)
      return total

    total_vente_comptant = _sum_if(ventes, "COMPTANT")
    total_vente_credit = _sum_if(ventes, "CREDIT")
    total_vente_assurance = _sum_if(ventes, "ASSURANCE")

    total_bon_caisse_generes = sum(int(getattr(b, "montant", 0) or 0) for b in bon_caisse_generes)
    total_bon_caisse_encaisse = sum(int(getattr(b, "montant", 0) or 0) for b in bon_caisse_encaisse)
    total_depenses = sum(
      int((getattr(d, "quantite", 0) or 0) * (getattr(d, "prix_unitaire", 0) or 0)) for d in depenses
    )
    total_retour_produits = sum(int(getattr(x, "quantite", 0) or 0) for x in (produit_retour_list or []))

    montant_system = (
      total_vente_comptant
      + total_bon_caisse_generes
      - total_bon_caisse_encaisse
      - total_depenses
      - total_retour_produits
    )
    # fondCaisseFerme peut être None; en Kotlin: caisse.fondCaisseFerme ?: 0
    fond_ferme = float(getattr(caisse, "fond_caisse_ferme", 0) or 0.0)
    difference = fond_ferme - float(montant_system or 0.0)

    # ---------- Parse fermetureCaisse ----------
    data_fermeture: Optional[str] = getattr(caisse, "fermeture_caisse", None)
    total_caisse_espece = 0
    total_caisse_electronique = 0
    total_caisse_ticket = 0

    if data_fermeture:
      lignes = data_fermeture.split("|")
      for index, ligne in enumerate(lignes):
        if index == 0:
          # ligne espèces, format: a-b-c-d-e-f-g-h-i-j
          valeurs = ligne.split("-")
          for i, v_str in enumerate(valeurs):
            v = int(v_str) if v_str.isdigit() else 0
            montant = 0
            if i == 0:
              montant = v * 25
            elif i == 1:
              montant = v * 50
            elif i == 2:
              montant = v * 100
            elif i == 3:
              montant = v * 500
            elif i == 4:
              montant = v * 10
            elif i == 5:
              montant = v * 500
            elif i == 6:
              montant = v * 1000
            elif i == 7:
              montant = v * 2000
            elif i == 8:
              montant = v * 5000
            elif i == 9:
              montant = v * 10000
            total_caisse_espece += montant
        elif index == 1:
          try:
            total_caisse_electronique = int(ligne)
          except Exception:
            total_caisse_electronique = 0
        elif index == 2:
          try:
            total_caisse_ticket = int(ligne)
          except Exception:
            total_caisse_ticket = 0

    solde_reel_espece = total_caisse_espece
    solde_reel_electronique = total_caisse_electronique
    solde_reel_ticket = total_caisse_ticket

    solde_systeme_espece = prix_total_facture_espece
    solde_systeme_electronique = prix_total_facture_electronique
    solde_systeme_ticket = prix_total_facture_ticket

    solde_reel_total = solde_reel_espece + solde_reel_electronique + solde_reel_ticket
    solde_systeme_total = solde_systeme_espece + solde_systeme_electronique + solde_systeme_ticket

    # ---------- Retour final ----------
    return {
      "ventes": ventes,
      "bonCaisseGeneres": bon_caisse_generes,
      "bonCaisseEncaisse": bon_caisse_encaisse,
      "depenses": depenses_map,
      "encaissementFactureData": list_vente_credit,
      "retourProduits": retour_produits_map,
      "produitRetourList": produit_retour_list,
      "listReduction": list_reduction,
      "prixTotalVenteReduction": prix_total_vente_reduction,
      "prixTotalFactureRendu": prix_total_facture_rendu,
      "totalVenteComptant": total_vente_comptant,
      "totalVenteCredit": total_vente_credit,
      "totalVenteAssurance": total_vente_assurance,
      "totalBonCaisseGeneres": total_bon_caisse_generes,
      "totalBonCaisseEncaisse": total_bon_caisse_encaisse,
      "totalDepenses": total_depenses,
      "totalRetourProduits": total_retour_produits,
      "montantSystem": montant_system,
      "difference": difference,
      "caisse": caisseData,
      "prixTotalEncaissementVente": prix_total_encaissement_vente,
      "prixTotalGrossiste": prix_total_grossiste,
      "prixTotalDetaillant": prix_total_detaillant,
      "prixTotalDetail": prix_total_detail,
      "prixTotalVente": prix_total_vente,
      "prixTotalVenteCredit": prix_total_vente_credit,
      "prixTotalVenteComptant": prix_total_vente_comptant,
      "prixTotalVenteAssurance": prix_total_vente_assurance,
      "soldeReelEspece": solde_reel_espece,
      "soldeReelElectronique": solde_reel_electronique,
      "soldeReelTicket": solde_reel_ticket,
      "soldeSystemeEspece": solde_systeme_espece,
      "soldeSystemeElectronique": solde_systeme_electronique,
      "soldeSystemeTicket": solde_systeme_ticket,
      "soldeReelTotal": solde_reel_total,
      "soldeSystemelTotal": solde_systeme_total,
    }
