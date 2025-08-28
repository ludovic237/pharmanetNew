# services/vente_service.py
from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
import unicodedata

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.concerner import Concerner
from app.models.facturation import Facturation
from app.models.facture_electronique import FactureElectronique
from app.models.facture_espece import FactureEspece
from app.models.facture_ticket import FactureTicket
from app.models.prescripteur import Prescripteur
from app.models.user import User
from app.models.vente import Vente
from app.schemas.vente_dto import VenteRequestDto, EncaissementDirectDto, EncaissementDto, VentePageableCustomlDto, \
  EncaissementRequestDto


def _now() -> datetime:
  return datetime.now()


def _parse_int(x, default=0) -> int:
  try:
    return int(x)
  except Exception:
    return default


def _require(value, msg: str):
  if value is None:
    raise HTTPException(status_code=404, detail=msg)
  return value


def _page_sizing(page: int, size: int) -> Tuple[int, int]:
  page = page if page >= 0 else 0
  size = size if size >= 1 else 10
  return page, size


def _remove_accents_lower(s: str) -> str:
  return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode("ascii").lower()


class VenteService:
  """
  Port Python de VenteService.kt.
  Tous les appels Spring Data (`findAll(spec, pageable)`, `findBy...`) sont attendus
  dans les repositories injectés ci-dessous, à implémenter côté Python/SQLAlchemy.
  """

  def __init__(
    self,
    db: Session,
    *,
    enrayon_repo,
    caisse_service,
    concerner_repo,
    prescripteur_repo,
    bon_caisse_repo,
    user_repo,
    vente_repo,
    caisse_repo,
    produit_repo,
    facturation_repo,
    facture_espece_repo,
    facture_electronique_repo,
    facture_ticket_repo,
    employe_repo,
    user_utils,
    rayon_repo,
    produit_detail_repo,
  ):
    self.db = db
    self.enrayon_repo = enrayon_repo
    self.caisse_service = caisse_service
    self.concerner_repo = concerner_repo
    self.prescripteur_repo = prescripteur_repo
    self.bon_caisse_repo = bon_caisse_repo
    self.user_repo = user_repo
    self.vente_repo = vente_repo
    self.caisse_repo = caisse_repo
    self.produit_repo = produit_repo
    self.facturation_repo = facturation_repo
    self.facture_espece_repo = facture_espece_repo
    self.facture_electronique_repo = facture_electronique_repo
    self.facture_ticket_repo = facture_ticket_repo
    self.employe_repo = employe_repo
    self.user_utils = user_utils
    self.rayon_repo = rayon_repo
    self.produit_detail_repo = produit_detail_repo

  # ---------------------------------------------------------------------
  # creerVenteSansEncaissement(venteRequestDto)
  # ---------------------------------------------------------------------
  def creer_vente_sans_encaissement(self, dto: VenteRequestDto) -> Vente:
    employe = self.user_utils.get_current_employe()
    _require(employe, "Impossible de récupérer l'utilisateur connecté.")

    if dto.etat not in ("COMPTANT", "ASSURANCE", "CREDIT"):
      raise HTTPException(status_code=400, detail=f"État de la vente invalide: {dto.etat}")

    # Client
    client: Optional[User] = None
    t = (dto.clientInfo or {}).get("type")
    if t == "existing":
      client_id = _require((dto.clientInfo or {}).get("id"), "Client.id requis")
      client = self.user_repo.find_by_id(int(client_id))
      _require(client, f"Client introuvable avec l'ID: {client_id}")
    elif t == "new":
      name = (dto.clientInfo or {}).get("name") or _require(None, "Nom du client requis")
      phone = (dto.clientInfo or {}).get("phone") or _require(None, "Téléphone du client requis")
      client = User(nom=name, telephone=phone)
      self.user_repo.save(client)
    elif t == "none":
      client = None
    else:
      raise HTTPException(status_code=400, detail=f"Type de client invalide: {t}")

    # Prescripteur
    prescripteur: Optional[Prescripteur] = None
    pt = (dto.prescripteurInfo or {}).get("type")
    if pt == "existing":
      pid = _require((dto.prescripteurInfo or {}).get("id"), "Prescripteur.id requis")
      prescripteur = self.prescripteur_repo.find_by_id(int(pid))
      _require(prescripteur, f"Prescripteur introuvable avec l'ID: {pid}")
    elif pt == "new":
      pname = (dto.prescripteurInfo or {}).get("name")
      if pname:
        prescripteur = Prescripteur(nom=pname)
        self.prescripteur_repo.save(prescripteur)
    elif pt == "none":
      prescripteur = None
    else:
      raise HTTPException(status_code=400, detail=f"Type de prescripteur invalide: {pt}")

    active_caisse = self.caisse_service.get_caisse_active()
    now = _now()
    ref = self.generer_reference(self.vente_repo.count_mois())

    vente = Vente(
      id=int(now.strftime("%Y%m%d%H%M%S")),
      employe=employe,
      reduction=str(dto.prixReduction or 0),
      caisse=None if dto.etat == "CREDIT" else active_caisse,
      reference=ref,
      dateVente=now,
      etat=dto.etat,
      prixTotal=(dto.prixTotal or 0.0) - (dto.prixReduction or 0.0),
      commentaire=dto.commentaire,
      user=client,
      prescripteur=prescripteur,
      supprimer=0,
    )
    vente = self.vente_repo.save(vente)

    # Si réduction utilisée, décrémente le quota d'employé
    if dto.reductionEnabled:
      employe.faireReductionMax = _parse_int(employe.faireReductionMax) - _parse_int(dto.prixReduction)
      self.employe_repo.save(employe)

    # Détail des produits vendus
    for p in (dto.produits or []):
      ptype = (p.type or "").lower()
      qte = _parse_int(p.quantite, 0)

      if ptype == "detail":
        produit_detail = _require(
          self.produit_detail_repo.find_by_id(int(p.produitId)),
          f"ProduitDetail introuvable: {p.produitId}",
        )
        produit_detail.stock = _parse_int(produit_detail.stock) - qte
        self.produit_detail_repo.save(produit_detail)

        con = Concerner(
          venteId=vente.id,
          produitId=produit_detail.id,
          quantite=qte,
          prixUnit=p.prixUnit,
          type=p.type,
          reduction=p.reduction,
        )
        self.concerner_repo.save(con)
      else:
        er = _require(
          self.enrayon_repo.find_by_id(str(p.rayonId)),
          f"EnRayon introuvable: {p.rayonId}",
        )
        er.quantiteRestante = _parse_int(er.quantiteRestante) - qte
        self.enrayon_repo.save(er)

        prod = _require(
          self.produit_repo.find_by_id(int(er.produitId)),
          f"Produit introuvable avec l'ID: {p.produitId}",
        )
        prod.stock = _parse_int(prod.stock) - qte
        self.produit_repo.save(prod)

        con = Concerner(
          venteId=vente.id,
          produitId=prod.id,
          enRayonId=er.id,
          quantite=qte,
          prixUnit=p.prixUnit,
          type=p.type,
          reduction=p.reduction,
        )
        self.concerner_repo.save(con)

    return vente

  # ---------------------------------------------------------------------
  # encaisserVenteDirect(encaissementDirectDto)
  # ---------------------------------------------------------------------
  def encaisser_vente_direct(self, dto: EncaissementDirectDto) -> Vente:
    employe = self.user_utils.get_current_employe()
    _require(employe, "Impossible de récupérer l'utilisateur connecté.")

    vdto = dto.venteRequestDto
    if vdto.etat not in ("COMPTANT", "ASSURANCE", "CREDIT"):
      raise HTTPException(status_code=400, detail=f"État de la vente invalide: {vdto.etat}")

    # Client
    client: Optional[User] = None
    t = (vdto.clientInfo or {}).get("type")
    if t == "existing":
      cid = _require((vdto.clientInfo or {}).get("id"), "Client.id requis")
      client = self.user_repo.find_by_id(int(cid))
      _require(client, f"Client introuvable avec l'ID: {cid}")
    elif t == "new":
      name = (vdto.clientInfo or {}).get("name") or _require(None, "Nom du client requis")
      phone = (vdto.clientInfo or {}).get("phone") or _require(None, "Téléphone du client requis")
      client = User(nom=name, telephone=phone)
      self.user_repo.save(client)
    elif t == "none":
      client = None
    else:
      raise HTTPException(status_code=400, detail=f"Type de client invalide: {t}")

    # Prescripteur
    prescripteur: Optional[Prescripteur] = None
    pt = (vdto.prescripteurInfo or {}).get("type")
    if pt == "existing":
      pid = _require((vdto.prescripteurInfo or {}).get("id"), "Prescripteur.id requis")
      prescripteur = self.prescripteur_repo.find_by_id(int(pid))
      _require(prescripteur, f"Prescripteur introuvable avec l'ID: {pid}")
    elif pt == "new":
      pname = (vdto.prescripteurInfo or {}).get("name")
      if pname:
        prescripteur = Prescripteur(nom=pname)
        self.prescripteur_repo.save(prescripteur)

    active_caisse = self.caisse_service.get_caisse_active()
    now = _now()
    ref = self.generer_reference(self.vente_repo.count_mois())

    vente = Vente(
      id=int(now.strftime("%Y%m%d%H%M%S")),
      employe=employe,
      reduction=str(vdto.prixReduction or 0),
      caisse=active_caisse,
      reference=ref,
      dateVente=now,
      etat=vdto.etat,
      prixTotal=(vdto.prixTotal or 0.0) - (vdto.prixReduction or 0.0),
      commentaire=vdto.commentaire,
      user=client,
      prescripteur=prescripteur,
      supprimer=0,
      dateEncaissement=now,
      prixPercu=float((dto.encaissementDto or {}).get("montantPercu") or 0.0),
    )
    vente = self.vente_repo.save(vente)

    if vdto.reductionEnabled:
      employe.faireReductionMax = _parse_int(employe.faireReductionMax) - _parse_int(vdto.prixReduction)
      self.employe_repo.save(employe)

    # Détail produits (idem creer_vente_sans_encaissement)
    for p in (vdto.produits or []):
      ptype = (p.type or "").lower()
      qte = _parse_int(p.quantite, 0)

      if ptype == "detail":
        produit_detail = _require(self.produit_detail_repo.find_by_id(int(p.produitId)),
                                  f"ProduitDetail introuvable: {p.produitId}")
        produit_detail.stock = _parse_int(produit_detail.stock) - qte
        self.produit_detail_repo.save(produit_detail)

        self.concerner_repo.save(Concerner(
          venteId=vente.id, produitId=produit_detail.id, quantite=qte,
          prixUnit=p.prixUnit, type=p.type, reduction=p.reduction,
        ))
      else:
        er = _require(self.enrayon_repo.find_by_id(str(p.rayonId)), f"EnRayon introuvable: {p.rayonId}")
        er.quantiteRestante = _parse_int(er.quantiteRestante) - qte
        self.enrayon_repo.save(er)

        prod = _require(self.produit_repo.find_by_id(int(er.produitId)), "Produit introuvable")
        prod.stock = _parse_int(prod.stock) - qte
        self.produit_repo.save(prod)

        self.concerner_repo.save(Concerner(
          venteId=vente.id, produitId=prod.id, enRayonId=er.id, quantite=qte,
          prixUnit=p.prixUnit, type=p.type, reduction=p.reduction,
        ))

    # Facturation + lignes selon type
    fact = Facturation(
      id=int(self.generate_id()),
      vente=vente,
      caisse=active_caisse,
      typePaiement=(dto.encaissementDto or {}).get("typeEncaissement"),
      montantPercu=(dto.encaissementDto or {}).get("montantPercu"),
      reste=(dto.encaissementDto or {}).get("montantRendu"),
      montantTtc=int(vente.prixTotal or 0),
      dateFacture=now,
      supprimer=0,
    )
    fact = self.facturation_repo.save(fact)

    type_e = _remove_accents_lower((dto.encaissementDto or {}).get("typeEncaissement", ""))

    if type_e == "espece":
      montant = (dto.encaissementDto or {}).get("espece")
      if montant is not None:
        self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=montant))

    elif type_e == "electronique":
      el = (dto.encaissementDto or {}).get("electronique") or {}
      self.facture_electronique_repo.save(
        FactureElectronique(facturationId=fact.id, numeroTelephone=el.get("numeroTelephone"),
                            montant=el.get("montantElectronique"))
      )

    elif type_e == "ticket":
      tk = (dto.encaissementDto or {}).get("ticket") or {}
      ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(tk.get("numeroTicket")),
                        "Ticket introuvable")
      ticket.type = "Encaisser"
      ticket.dateEncaisser = now
      ticket.caisseIdEncaisser = active_caisse.id if active_caisse else None
      self.bon_caisse_repo.save(ticket)

      self.facture_ticket_repo.save(
        FactureTicket(facturationId=fact.id, ticketCaisseId=ticket.id, montant=tk.get("montantTicket"))
      )

    elif type_e == "mixte":
      # espèces
      montant = (dto.encaissementDto or {}).get("espece")
      if montant is not None:
        self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=montant))
      # électronique
      el = (dto.encaissementDto or {}).get("electronique") or {}
      self.facture_electronique_repo.save(
        FactureElectronique(facturationId=fact.id, numeroTelephone=el.get("numeroTelephone"),
                            montant=el.get("montantElectronique"))
      )
      # ticket
      tk = (dto.encaissementDto or {}).get("ticket") or {}
      ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(tk.get("numeroTicket")),
                        "Ticket introuvable")
      ticket.type = "Encaisser"
      ticket.dateEncaisser = now
      ticket.caisseIdEncaisser = active_caisse.id if active_caisse else None
      self.bon_caisse_repo.save(ticket)
      self.facture_ticket_repo.save(
        FactureTicket(facturationId=fact.id, ticketCaisseId=ticket.id, montant=tk.get("montantTicket"))
      )
    else:
      raise HTTPException(status_code=400, detail=f"Type de paiement non pris en charge: {type_e}")

    return vente

  # ---------------------------------------------------------------------
  # encaisserVente(venteId, EncaissementRequestDto)  -> Facturation
  # ---------------------------------------------------------------------
  def encaisser_vente_par_id(self, vente_id: int, req: EncaissementRequestDto) -> Facturation:
    vente = self.vente_repo.find_by_id(int(vente_id))
    _require(vente, f"Vente introuvable avec l'ID: {vente_id}")

    if getattr(vente, "etat", "") != "EN_COURS":
      raise HTTPException(status_code=400, detail="La vente doit être en cours pour être encaissée.")

    caisse = self.caisse_service.get_caisse_active()
    fact = Facturation(
      id=int(self.generate_id()),
      vente=vente,
      caisse=caisse,
      typePaiement=req.typePaiement,
      montantPercu=req.montantPercu,
      reste=req.reste,
      montantTtc=req.montantTtc,
      dateFacture=_now(),
      supprimer=0,
    )
    # Lignes selon type
    t = _remove_accents_lower(req.typePaiement)
    if t == "espece" and req.espece is not None:
      self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=req.espece))
    elif t == "electronique" and req.electronique:
      self.facture_electronique_repo.save(
        FactureElectronique(facturationId=fact.id,
                            numeroTelephone=req.electronique.numeroTelephone,
                            montant=req.electronique.montant)
      )
    elif t == "ticket" and req.ticket is not None:
      self.facture_ticket_repo.save(FactureTicket(facturationId=fact.id, montant=req.ticket))
    elif t == "mixte":
      if req.espece is not None:
        self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=req.espece))
      if req.electronique:
        self.facture_electronique_repo.save(
          FactureElectronique(facturationId=fact.id,
                              numeroTelephone=req.electronique.numeroTelephone,
                              montant=req.electronique.montant)
        )
      if req.ticket is not None:
        self.facture_ticket_repo.save(FactureTicket(facturationId=fact.id, montant=req.ticket))
    else:
      raise HTTPException(status_code=400, detail=f"Type de paiement non pris en charge: {req.typePaiement}")

    # En Kotlin la mise à jour d'état est commentée
    # vente.etat = "ENCAISSE"
    self.vente_repo.save(vente)
    return self.facturation_repo.save(fact)

  # ---------------------------------------------------------------------
  # encaisserVente(EncaissementDto) -> Facturation
  # ---------------------------------------------------------------------
  def encaisser_vente(self, dto: EncaissementDto) -> Facturation:
    dto.typeEncaissement = _remove_accents_lower(dto.typeEncaissement)
    vente = _require(self.vente_repo.find_by_id(int(dto.venteId)), "Vente introuvable")

    caisse = self.caisse_service.get_caisse_active()
    fact = Facturation(
      id=int(self.generate_id()),
      vente=vente,
      caisse=caisse,
      typePaiement=dto.typeEncaissement,
      montantPercu=dto.montantPercu,
      reste=dto.montantRendu,
      montantTtc=int(vente.prixTotal or 0),
      dateFacture=_now(),
      supprimer=0,
    )
    fact = self.facturation_repo.save(fact)

    if dto.typeEncaissement == "espece" and dto.espece is not None:
      self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=dto.espece))
    elif dto.typeEncaissement == "electronique" and dto.electronique:
      self.facture_electronique_repo.save(
        FactureElectronique(facturationId=fact.id,
                            numeroTelephone=dto.electronique.numeroTelephone,
                            montant=dto.electronique.montantElectronique)
      )
    elif dto.typeEncaissement == "ticket" and dto.ticket:
      ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(dto.ticket.numeroTicket), "Ticket introuvable")
      ticket.type = "Encaisser"
      ticket.dateEncaisser = _now()
      ticket.caisseIdEncaisser = (self.caisse_service.get_caisse_active() or {}).id if self.caisse_service else None
      self.bon_caisse_repo.save(ticket)

      self.facture_ticket_repo.save(
        FactureTicket(facturationId=fact.id, ticketCaisseId=ticket.id, montant=dto.ticket.montantTicket)
      )
    elif dto.typeEncaissement == "mixte":
      if dto.espece is not None:
        self.facture_espece_repo.save(FactureEspece(facturationId=fact.id, montant=dto.espece))
      if dto.electronique:
        self.facture_electronique_repo.save(
          FactureElectronique(facturationId=fact.id,
                              numeroTelephone=dto.electronique.numeroTelephone,
                              montant=dto.electronique.montantElectronique)
        )
      if dto.ticket:
        ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(dto.ticket.numeroTicket), "Ticket introuvable")
        ticket.type = "Encaisser"
        ticket.dateEncaisser = _now()
        ticket.caisseIdEncaisser = (self.caisse_service.get_caisse_active() or {}).id if self.caisse_service else None
        self.bon_caisse_repo.save(ticket)
        self.facture_ticket_repo.save(
          FactureTicket(facturationId=fact.id, ticketCaisseId=ticket.id, montant=dto.ticket.montantTicket)
        )
    else:
      raise HTTPException(status_code=400, detail=f"Type de paiement non pris en charge: {dto.typeEncaissement}")

    vente.prixPercu = float(dto.montantPercu or 0.0)
    vente.dateEncaissement = _now()
    vente.caisse = caisse
    self.vente_repo.save(vente)
    return fact

  # ---------------------------------------------------------------------
  def generate_id(self) -> str:
    return _now().strftime("%Y%m%d%H%M%S")

  # ---------------------------------------------------------------------
  # chargerVentesEnCoursNonEncaisser(venteId)
  # ---------------------------------------------------------------------
  def charger_ventes_en_cours_non_encaisser(self, vente_id: int) -> Dict[str, Any]:
    vente = _require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable")
    if vente.prixPercu is not None and vente.prixPercu > 0:
      raise HTTPException(status_code=400, detail="La vente est déjà encaissée.")

    produits = []
    for c in self.concerner_repo.find_by_vente_id(int(vente.id)):
      nom, pid = None, None
      if c.type == "detail":
        pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
        _require(pd, "ProduitDetail introuvable")
        nom, pid = pd.nom, pd.id
      else:
        er = _require(self.enrayon_repo.find_by_id(str(c.enRayonId)), "EnRayon introuvable")
        p = _require(self.produit_repo.find_by_id(int(er.produitId)), "Produit introuvable")
        nom, pid = p.nom, p.id
      produits.append({
        "id": c.id,
        "nom": nom,
        "prixUnitaire": c.prixUnit,
        "quantite": c.quantite,
        "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite),
        "reduction": c.reduction,
        "type": c.type,
      })
    return {"vente": vente, "produits": produits}

  # ---------------------------------------------------------------------
  # supprimerVente(venteId) → suppression logique + lignes
  # ---------------------------------------------------------------------
  def supprimer_vente(self, vente_id: int) -> Dict[str, Any]:
    vente = _require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable")
    if _parse_int(vente.supprimer) == 1:
      raise HTTPException(status_code=400, detail="La vente est déjà supprimée.")
    vente.supprimer = 1
    self.vente_repo.save(vente)
    for c in self.concerner_repo.find_by_vente_id(int(vente.id)):
      c.supprimer = 1
      self.concerner_repo.save(c)
    return {"message": "vente supprimée avec succès"}

  # ---------------------------------------------------------------------
  # listerVentes() -> List<Map>
  # ---------------------------------------------------------------------
  def lister_ventes(self) -> List[Dict[str, Any]]:
    out = []
    for v in self.vente_repo.find_all():
      out.append({
        "netAPayer": v.prixTotal,
        "reduction": v.reduction,
        "reference": v.reference,
        "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
        "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
        "commentaire": v.commentaire,
        "dateVente": v.dateVente,
        "actions": "edit,delete",
      })
    return out

  # ---------------------------------------------------------------------
  # listerVenteParNombreDeJourEtFournisseur(fournisseurId, jour)
  # ---------------------------------------------------------------------
  def lister_vente_par_nombre_de_jour_et_fournisseur(self, fournisseur_id: Optional[str], jour: int) -> List[Dict[str, Any]]:
    date_debut = _now() - timedelta(days=jour)
    date_fin = _now()
    ventes = self.vente_repo.find_by_date_vente_between_and_supprimer(date_debut, date_fin)

    produits: List[Dict[str, Any]] = []
    for v in ventes:
      for c in self.concerner_repo.find_by_vente_id(int(v.id)):
        if _parse_int(c.enRayonId) > 1000:
          er = self.enrayon_repo.find_by_id(str(c.enRayonId))
          p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
          if not p or not er:
            continue
          if fournisseur_id == "null":
            produits.append({
              "id": p.id, "nom": p.nom, "prix": c.prixUnit, "stock": p.stock,
              "fournisseur": er.fournisseur.nom if er.fournisseur else None,
              "dateLivraison": er.dateLivraison, "datePeremption": er.datePeremption,
              "quantiteStock": p.stock, "prixAchat": er.prixAchat, "quantiteRestante": 0,
            })
          elif fournisseur_id and int(fournisseur_id) > 0:
            if er.fournisseur and int(er.fournisseur.id) == int(fournisseur_id):
              produits.append({
                "id": p.id, "nom": p.nom, "prix": c.prixUnit, "stock": p.stock,
                "fournisseur": er.fournisseur.nom, "dateLivraison": er.dateLivraison,
                "datePeremption": er.datePeremption, "quantiteStock": p.stock,
                "prixAchat": er.prixAchat, "quantiteRestante": 0,
              })
          else:
            produits.append({
              "id": p.id, "nom": p.nom, "prix": c.prixUnit, "stock": p.stock,
              "fournisseur": er.fournisseur.nom if er.fournisseur else None,
              "dateLivraison": er.dateLivraison, "datePeremption": er.datePeremption,
              "quantiteStock": p.stock, "prixAchat": er.prixAchat, "quantiteRestante": 0,
            })
    # distinct par nom
    seen = set()
    uniq = []
    for d in produits:
      if d["nom"] not in seen:
        seen.add(d["nom"])
        uniq.append(d)
    return uniq

  # ---------------------------------------------------------------------
  # listerVentesNonEncaissees(pageable) -> Page<Map>
  # ---------------------------------------------------------------------
  def lister_ventes_non_encaissees(self, page: int, size: int, sort: str, direction: str, search: Optional[str]) -> Dict[str, Any]:
    page, size = _page_sizing(page, size)
    caisse = self.caisse_service.get_caisse_active()
    if not caisse:
      return {"content": [], "totalElements": 0, "totalPages": 0, "pageSize": size, "pageNumber": page}

    spec = self.vente_repo.spec_filter(caisse=caisse, price_percu_mode=0, encaisse_mode=0,
                                       etat="null", dateVente="null", dateEncaissement="null",
                                       userId="null", employeId="null", prescripteurId="null", caisseId="null",
                                       search=search)
    rows, total = self.vente_repo.find_all(spec, page, size, sort="dateVente", direction="DESC")
    content = [{
      "id": v.id, "netAPayer": v.prixTotal, "reduction": v.reduction, "reference": v.reference,
      "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
      "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
      "commentaire": v.commentaire, "dateVente": v.dateVente, "actions": "edit,delete",
    } for v in rows]
    return {
      "content": content, "totalElements": total,
      "totalPages": (total + size - 1) // size, "pageSize": size, "pageNumber": page
    }

  # ---------------------------------------------------------------------
  # listerVentesEncaissees(pageable) -> Page<Map>
  # ---------------------------------------------------------------------
  def lister_ventes_encaissees(self, page: int, size: int, sort: str, direction: str, search: Optional[str]) -> Dict[str, Any]:
    page, size = _page_sizing(page, size)
    caisse = self.caisse_service.get_caisse_active()
    spec = self.vente_repo.spec_filter(caisse=caisse, price_percu_mode=0, encaisse_mode=1,
                                       etat="null", dateVente="null", dateEncaissement="null",
                                       userId="null", employeId="null", prescripteurId="null", caisseId="null",
                                       search=search)
    rows, total = self.vente_repo.find_all(spec, page, size, sort="dateVente", direction="DESC")
    content = [{
      "id": v.id, "prixPercu": v.prixPercu, "netAPayer": v.prixTotal, "reduction": v.reduction,
      "reference": v.reference,
      "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
      "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
      "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.dateVente,
      "dateEncaissement": v.dateEncaissement, "actions": "edit,delete",
    } for v in rows]
    return {
      "content": content, "totalElements": total,
      "totalPages": (total + size - 1) // size, "pageSize": size, "pageNumber": page
    }

  # ---------------------------------------------------------------------
  # listerVentesCreditNonEncaissees(pageable)
  # ---------------------------------------------------------------------
  def lister_ventes_credit_non_encaissees(self, page: int, size: int, sort: str, direction: str, search: Optional[str]) -> Dict[str, Any]:
    page, size = _page_sizing(page, size)
    spec = self.vente_repo.spec_filter(caisse=None, price_percu_mode=0, encaisse_mode=0,
                                       etat="CREDIT", dateVente="null", dateEncaissement="null",
                                       userId="null", employeId="null", prescripteurId="null", caisseId="null",
                                       search=search)
    rows, total = self.vente_repo.find_all(spec, page, size, sort="dateVente", direction="DESC")
    content = []
    for v in rows:
      produits = []
      for c in self.concerner_repo.find_by_vente_id(int(v.id)):
        if c.type == "detail":
          pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
          nom, pid = pd.nom, pd.id
        else:
          er = self.enrayon_repo.find_by_id(str(c.enRayonId))
          p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
          nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
        produits.append({
          "id": c.id, "nom": nom, "produitId": pid, "quantite": c.quantite,
          "prixUnitaire": c.prixUnit, "reduction": c.reduction,
          "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite),
        })
      content.append({
        "id": v.id, "prixPercu": v.prixPercu, "netAPayer": v.prixTotal, "reduction": v.reduction,
        "reference": v.reference,
        "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
        "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
        "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.dateVente,
        "dateEncaissement": v.dateEncaissement, "produits": produits, "actions": "edit,delete",
      })
    return {
      "content": content, "totalElements": total,
      "totalPages": (total + size - 1) // size, "pageSize": size, "pageNumber": page
    }

  # ---------------------------------------------------------------------
  # chargerVentesEncaisser(venteId)
  # ---------------------------------------------------------------------
  def charger_ventes_encaisser(self, vente_id: int) -> Dict[str, Any]:
    vente = _require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable")
    if vente.prixPercu is None or vente.prixPercu <= 0:
      # NB: le code Kotlin a une condition inversée / message ambigu
      raise HTTPException(status_code=400, detail="La vente n'est pas encore encaissée.")
    produits = []
    for c in self.concerner_repo.find_by_vente_id(int(vente.id)):
      if c.type == "detail":
        pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
        nom = pd.nom
      else:
        er = self.enrayon_repo.find_by_id(str(c.enRayonId))
        p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
        nom = getattr(p, "nom", None)
      produits.append({
        "id": c.id, "nom": nom, "prixUnitaire": c.prixUnit, "quantite": c.quantite,
        "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite), "reduction": c.reduction,
      })

    facturation = self.facturation_repo.find_by_vente(vente)
    t = _remove_accents_lower(getattr(facturation, "typePaiement", "") or "")

    montant_espece = self.facture_espece_repo.find_by_facturation_id(facturation.id).montant if t in ("espece", "mixte") else 0
    el = self.facture_electronique_repo.find_by_facturation_id(facturation.id) if t in ("electronique", "mixte") else None
    montant_electronique = getattr(el, "montant", 0)
    tk = self.facture_ticket_repo.find_by_facturation_id(facturation.id) if t in ("ticket", "mixte") else None
    montant_ticket = getattr(tk, "montant", 0)

    return {
      "vente": vente,
      "produits": produits,
      "montantFacturation": getattr(facturation, "montantTtc", 0),
      "montantEspece": montant_espece,
      "montantElectronique": montant_electronique,
      "montantTicket": montant_ticket,
    }

  # ---------------------------------------------------------------------
  # genererReference(numMois)
  # ---------------------------------------------------------------------
  def generer_reference(self, num: int) -> str:
    today = datetime.now().strftime("%y-%m-%d")
    annee, mois, jour = today[0:2], today[3:5], today[6:8]
    numero = int(num) + 1
    return f"ALS{annee}{mois}{jour}-{numero:04d}"

  # ---------------------------------------------------------------------
  # getVenteDetailsByReference(reference)
  # ---------------------------------------------------------------------
  def get_vente_details_by_reference(self, reference: str) -> Dict[str, Any]:
    vente = self.vente_repo.find_by_reference_and_supprimer(reference, 0)
    _require(vente, f"Vente not found with reference: {reference}")

    produits = []
    for c in filter(lambda x: _parse_int(x.quantite) > 0, self.concerner_repo.find_by_vente_id(int(vente.id))):
      if c.type == "detail":
        pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
        nom, pid = pd.nom, pd.id
      else:
        er = self.enrayon_repo.find_by_id(str(c.enRayonId))
        p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
        nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
      produits.append({
        "id": c.id, "nom": nom, "produitId": pid, "rayonId": c.enRayonId,
        "quantite": c.quantite, "prixUnitaire": c.prixUnit, "reduction": c.reduction,
        "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite),
      })
    return {"vente": vente, "produits": produits}

  # ---------------------------------------------------------------------
  # getVenteDetailsByVenteId(venteId)
  # ---------------------------------------------------------------------
  def get_vente_details_by_vente_id(self, vente_id: str) -> Dict[str, Any]:
    vente = self.vente_repo.find_by_id_and_supprimer(int(vente_id), 0)
    _require(vente, f"Vente not found with reference: {vente_id}")
    produits = []
    for c in filter(lambda x: _parse_int(x.quantite) > 0, self.concerner_repo.find_by_vente_id(int(vente.id))):
      if c.type == "detail":
        pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
        nom, pid = pd.nom, pd.id
      else:
        er = self.enrayon_repo.find_by_id(str(c.enRayonId))
        p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
        nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
      produits.append({
        "id": c.id, "nom": nom, "produitId": pid, "rayonId": c.enRayonId,
        "quantite": c.quantite, "prixUnitaire": c.prixUnit, "reduction": c.reduction,
        "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite),
      })
    return {"vente": vente, "produits": produits}

  # ---------------------------------------------------------------------
  def convert_to_simple_string(self, s: str) -> str:
    return _remove_accents_lower(s)

  # ---------------------------------------------------------------------
  # envoyerVentreCreditEnCaisse(venteId)
  # ---------------------------------------------------------------------
  def envoyer_vente_credit_en_caisse(self, vente_id: str) -> Vente:
    caisse = self.caisse_service.get_caisse_active()
    vente = _require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable")
    vente.caisse = caisse
    return self.vente_repo.save(vente)

  # ---------------------------------------------------------------------
  # listerVentesPageableDetail(pageable,...)
  # ---------------------------------------------------------------------
  def lister_ventes_pageable_detail(
    self, *, page: int, size: int, sort: str, direction: str,
    etat: Optional[str] = None,
    startDateVente: Optional[str] = None, endDateVente: Optional[str] = None,
    startDateEncaissement: Optional[str] = None, endDateEncaissement: Optional[str] = None,
    userId: Optional[str] = None, employeId: Optional[str] = None,
    prescripteurId: Optional[str] = None, caisseId: Optional[str] = None,
    search: Optional[str] = None,
  ) -> VentePageableCustomlDto:
    active_caisse = self.caisse_service.get_caisse_active()
    if caisseId == "non":
      active_caisse = None

    spec = self.vente_repo.spec_filter_range(
      caisse=active_caisse, price_percu_mode=0, encaisse_mode=1, etat=etat,
      startDateVente=startDateVente, endDateVente=endDateVente,
      startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
      userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
      search=search,
    )
    rows, total = self.vente_repo.find_all(spec, page, size, sort="dateVente", direction="DESC")

    def _map(v: Vente) -> Dict[str, Any]:
      produits = []
      for c in self.concerner_repo.find_by_vente_id(int(v.id)):
        if c.type == "detail":
          pd = self.produit_detail_repo.find_by_id(int(c.enRayonId))
          nom, pid = pd.nom, pd.id
        else:
          er = self.enrayon_repo.find_by_id(str(c.enRayonId))
          p = self.produit_repo.find_by_id(int(er.produitId)) if er else None
          nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
        produits.append({
          "id": c.id, "nom": nom, "produitId": pid, "quantite": c.quantite,
          "prixUnitaire": c.prixUnit, "reduction": c.reduction,
          "prixTotal": _parse_int(c.prixUnit) * _parse_int(c.quantite),
        })
      return {
        "id": v.id, "prixPercu": v.prixPercu, "netAPayer": v.prixTotal, "reduction": v.reduction,
        "reference": v.reference,
        "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
        "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
        "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.dateVente,
        "dateEncaissement": v.dateEncaissement, "produits": produits, "actions": "edit,delete",
      }

    content = [_map(v) for v in rows]
    # totalAmount global (requête complète non paginée)
    total_amount = 0.0
    if total > 0:
      all_rows, _ = self.vente_repo.find_all(spec, page=0, size=total, sort="dateVente", direction="DESC")
      total_amount = sum((r.prixTotal or 0.0) for r in all_rows)

    return VentePageableCustomlDto(
      content=content,
      totalElements=total,
      totalPages=(total + size - 1) // size if size else 1,
      pageSize=size,
      pageNumber=page,
      totalAmount=total_amount,
      data={},
    )

  # ---------------------------------------------------------------------
  # listerVentesPageableDetailPrint(..., output_path)
  # ---------------------------------------------------------------------
  def lister_ventes_pageable_detail_print(
    self, *, page: int, size: int, sort: str, direction: str,
    etat: Optional[str] = None,
    startDateVente: Optional[str] = None, endDateVente: Optional[str] = None,
    startDateEncaissement: Optional[str] = None, endDateEncaissement: Optional[str] = None,
    userId: Optional[str] = None, employeId: Optional[str] = None,
    prescripteurId: Optional[str] = None, caisseId: Optional[str] = None,
    search: Optional[str] = None,
    output_path: str = "vente.pdf",
  ) -> None:
    # on réutilise la logique de lister_ventes_pageable_detail pour charger toutes les lignes
    res = self.lister_ventes_pageable_detail(
      page=page, size=size, sort=sort, direction=direction, etat=etat,
      startDateVente=startDateVente, endDateVente=endDateVente,
      startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
      userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
      search=search,
    )
    # Génération PDF (reportlab si dispo, sinon fallback texte)
    try:
      from reportlab.lib.pagesizes import A4, landscape
      from reportlab.pdfgen import canvas
      from reportlab.lib.units import mm

      c = canvas.Canvas(output_path, pagesize=landscape(A4))
      width, height = landscape(A4)
      y = height - 15 * mm
      c.setFont("Helvetica-Bold", 12)
      c.drawString(15 * mm, y, "Liste des ventes")
      y -= 8 * mm
      c.setFont("Helvetica", 8)
      headers = ["Id", "reference", "montant", "montant percu", "client", "vendeur",
                 "date encaissement", "date de vente", "etat", "employe"]
      c.drawString(15 * mm, y, " | ".join(headers)); y -= 6 * mm

      # on recharge toutes les lignes pour le print
      # (page=0, size=totalElements)
      content = res.content
      for v in content:
        client = v.get("infoClients") or "N/A"
        vendeur = v.get("vendeur") or "N/A"
        line = [
          str(v.get("id") or ""),
          str(v.get("reference") or ""),
          str(v.get("netAPayer") or ""),
          str(v.get("prixPercu") or ""),
          client,
          vendeur,
          str(v.get("dateEncaissement") or ""),
          str(v.get("dateVente") or ""),
          str(v.get("etat") or ""),
          str(vendeur),
        ]
        c.drawString(15 * mm, y, " | ".join(line))
        y -= 5 * mm
        if y < 15 * mm:
          c.showPage()
          y = height - 15 * mm
          c.setFont("Helvetica", 8)
      c.save()
    except Exception:
      # fallback très simple (texte)
      with open(output_path, "w", encoding="utf-8") as f:
        f.write("Liste des ventes\n")
        for v in res.content:
          f.write(str(v) + "\n")

  # ---------------------------------------------------------------------
  # listerVentesPageableDetailByProduit(...)
  # ---------------------------------------------------------------------
  def lister_ventes_pageable_detail_by_produit(
    self, *, page: int, size: int, sort: str, direction: str,
    etat: Optional[str] = None, produitId: Optional[str] = None,
    startDateVente: Optional[str] = None, endDateVente: Optional[str] = None,
    startDateEncaissement: Optional[str] = None, endDateEncaissement: Optional[str] = None,
    userId: Optional[str] = None, employeId: Optional[str] = None,
    prescripteurId: Optional[str] = None, caisseId: Optional[str] = None,
    search: Optional[str] = None,
  ) -> VentePageableCustomlDto:
    active_caisse = self.caisse_service.get_caisse_active()
    if caisseId == "non":
      active_caisse = None

    spec = self.vente_repo.spec_filter_range(
      caisse=active_caisse, price_percu_mode=0, encaisse_mode=1, etat=etat,
      startDateVente=startDateVente, endDateVente=endDateVente,
      startDateEncaissement=startDateEncaissement, endDateEncaissement=endDateEncaissement,
      userId=userId, employeId=employeId, prescripteurId=prescripteurId, caisseId=caisseId,
      search=search,
    )
    rows, total = self.vente_repo.find_all(spec, page, size, sort="dateVente", direction="DESC")

    content: List[Dict[str, Any]] = []
    for v in rows:
      enrayons = self.enrayon_repo.find_all_by_produit_id_and_supprimer(int(produitId)) if produitId else []
      concerner_list = self.concerner_repo.find_by_vente_id_and_enrayon_id_in(int(v.id), [e.id for e in enrayons])
      if concerner_list:
        d: Dict[str, Any] = {
          "venteId": v.id,
          "prixPercu": v.prixPercu,
          "netAPayer": v.prixTotal,
          "reference": v.reference,
          "commentaire": v.commentaire,
          "etat": v.etat,
          "date": v.dateVente,
          "dateEncaissement": v.dateEncaissement,
          "produits": [{"quantite": c.quantite, "prixUnitaire": c.prixUnit, "reduction": c.reduction}
                       for c in concerner_list],
          "quantite": sum(_parse_int(c.quantite) for c in concerner_list),
          "prixUnitaire": sum(_parse_int(c.prixUnit) for c in concerner_list),
          "reduction": sum(_parse_int(c.reduction) for c in concerner_list),
          "prixVente": v.prixTotal,
          "prixTotal": sum(_parse_int(c.quantite) * _parse_int(c.prixUnit) for c in concerner_list),
          "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
          "vendeur": (getattr(getattr(v.employe, "user", None), "nom", None) or "Invonnu"),
          "actions": "edit,delete",
        }
        content.append(d)

    # agrégats globaux
    prix_vente_total = sum(_parse_int(row.get("prixTotal")) for row in content)
    qte_vente_total = sum(_parse_int(row.get("quantite")) for row in content)
    reduction_total = sum(_parse_int(row.get("reduction")) for row in content)

    return VentePageableCustomlDto(
      content=content,
      totalElements=total if total else len(content),
      totalPages=(total + size - 1) // size if size else 1,
      pageSize=size,
      pageNumber=page,
      totalAmount=0.0,
      data={
        "prixVenteTotal": float(prix_vente_total),
        "qteVenteTotal": float(qte_vente_total),
        "reductionVenteTotal": float(reduction_total),
      },
    )
