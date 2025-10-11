# services/vente_service.py
from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
import unicodedata

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.concerner import Concerner
from app.models.employe import Employe
from app.models.facturation import Facturation
from app.models.facture_electronique import FactureElectronique
from app.models.facture_espece import FactureEspece
from app.models.facture_ticket import FactureTicket
from app.models.malade import Malade
from app.models.prescripteur import Prescripteur
from app.models.user import User
from app.models.vente import Vente
from app.repositories.bon_caisse_repository import BonCaisseRepository
from app.repositories.caisse_repository import CaisseRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.facturation_repository import FacturationRepository
from app.repositories.facture_electronique_repository import FactureElectroniqueRepository
from app.repositories.facture_espece_repository import FactureEspeceRepository
from app.repositories.facture_ticket_repository import FactureTicketRepository
from app.repositories.fournisseur_repository import FournisseurRepository
from app.repositories.prescripteur_repository import PrescripteurRepository
from app.repositories.produit_detail_repository import ProduitDetailRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.rayon_repository import RayonRepository
from app.repositories.user_repository import UserRepository
from app.repositories.vente_repository import VenteRepository
from app.schemas.vente_dto import VenteRequestDto, EncaissementDirectDto, EncaissementDto, VentePageableCustomlDto, \
    EncaissementRequestDto
from app.services.caisse_service import CaisseService
from app.utility.convert import to_camel_dict
from app.utility.user_utils import UserUtils


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
            db: Session):
        self.db = db
        self.enrayon_repo = EnRayonRepository(db)
        self.caisse_service = CaisseService
        self.concerner_repo = ConcernerRepository(db)
        self.prescripteur_repo = PrescripteurRepository(db)
        self.bon_caisse_repo = BonCaisseRepository(db)
        self.user_repo = UserRepository(db)
        self.vente_repo = VenteRepository(db)
        self.caisse_repo = CaisseRepository(db)
        self.produit_repo = ProduitRepository(db)
        self.facturation_repo = FacturationRepository(db)
        self.facture_espece_repo = FactureEspeceRepository(db)
        self.facture_electronique_repo = FactureElectroniqueRepository(db)
        self.facture_ticket_repo = FactureTicketRepository(db)
        self.employe_repo = EmployeRepository(db)
        self.user_utils = UserUtils
        self.rayon_repo = RayonRepository(db)
        self.produit_detail_repo = ProduitDetailRepository(db)
        self.fournis_repo = FournisseurRepository(db)

    # ---------------------------------------------------------------------
    # creerVenteSansEncaissement(venteRequestDto)
    # ---------------------------------------------------------------------
    def creer_vente_sans_encaissement(self, dto: VenteRequestDto, currentEmploye: Employe) -> Vente:
        employe = currentEmploye
        _require(employe, "Impossible de récupérer l'utilisateur connecté.")

        if dto.etat not in ("COMPTANT", "ASSURANCE", "CREDIT"):
            raise HTTPException(status_code=400, detail=f"État de la vente invalide: {dto.etat}")

        # Client
        client: Optional[User] = None

        t = (dto.clientInfo.type or {})
        if t == "existing":
            client_id = _require((dto.clientInfo.id or {}), "Client.id requis")
            client = self.user_repo.find_by_id(int(client_id))
            _require(client, f"Client introuvable avec l'ID: {client_id}")
        elif t == "new":
            name = (dto.clientInfo.nom or {})
            phone = (dto.clientInfo.phone or {})
            client = User(nom=name, telephone=phone)
            if dto.clientInfo.nom != "" and dto.clientInfo.phone != "":
                self.user_repo.save(client)
        elif t == "none":
            client = None
        else:
            raise HTTPException(status_code=400, detail=f"Type de client invalide: {t}")

        # Prescripteur
        prescripteur: Optional[Prescripteur] = None
        pt = (dto.prescripteurInfo.type or {})
        if pt == "existing":
            pid = _require((dto.prescripteurInfo.id or {}), "Prescripteur.id requis")
            prescripteur = self.prescripteur_repo.find_by_id(int(pid))
            _require(prescripteur, f"Prescripteur introuvable avec l'ID: {pid}")
        elif pt == "new":
            pname = (dto.prescripteurInfo.nom or {})
            if pname:
                prescripteur = Prescripteur(nom=pname)
                self.prescripteur_repo.save(prescripteur)
        elif pt == "none":
            prescripteur = Prescripteur()
        else:
            raise HTTPException(status_code=400, detail=f"Type de prescripteur invalide: {pt}")

        active_caisse = self.caisse_service.get_caisse_active_db(self.db)
        now = _now()
        ref = self.generer_reference(self.vente_repo.count_mois())

        malade = Malade()
        vente = Vente(
            id=int(datetime.now().strftime("%Y%m%d%H%M%S")),
            employe_id=employe.id,
            reduction=str(dto.prixReduction or 0),
            caisse_id=None if dto.etat == "CREDIT" else active_caisse.id,
            reference=ref,
            date_vente=now,
            etat=dto.etat,
            prix_total=(dto.prixTotal or 0.0) - (dto.prixReduction or 0.0),
            commentaire=dto.commentaire,
            user_id=None if client == None else client.id,
            malade_id=malade.id,
            prescripteur_id=(prescripteur.id or None),
            supprimer=0,
        )
        vente = self.vente_repo.save(vente)

        # Si réduction utilisée, décrémente le quota d'employé
        if dto.reductionEnabled:
            employe.faire_reduction_max = _parse_int(employe.faire_reduction_max) - _parse_int(dto.prixReduction)
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
                    vente_id=vente.id,
                    produit_id=produit_detail.id,
                    quantite=qte,
                    prix_unit=p.prixUnit,
                    type=p.type,
                    reduction=p.reduction,
                )
                self.concerner_repo.save(con)
            else:
                er = _require(
                    self.enrayon_repo.find_by_id(str(p.rayonId)),
                    f"EnRayon introuvable: {p.rayonId}",
                )
                er.quantite_restante = _parse_int(er.quantite_restante) - qte
                self.enrayon_repo.save(er)

                prod = _require(
                    self.produit_repo.find_by_id(int(er.produit_id)),
                    f"Produit introuvable avec l'ID: {p.produitId}",
                )
                prod.stock = _parse_int(prod.stock) - qte
                self.produit_repo.save(prod)

                con = Concerner(
                    vente_id=vente.id,
                    produit_id=prod.id,
                    en_rayon_id=er.id,
                    quantite=qte,
                    prix_unit=p.prixUnit,
                    type=p.type,
                    reduction=p.reduction,
                )
                self.concerner_repo.save(con)

        return vente

    # ---------------------------------------------------------------------
    # encaisserVenteDirect(encaissementDirectDto)
    # ---------------------------------------------------------------------
    def encaisser_vente_direct(self, dto: EncaissementDirectDto, currentEmploye: Employe) -> Vente:
        employe = currentEmploye
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
            name = (vdto.clientInfo or {}).get("name")
            phone = (vdto.clientInfo or {}).get("phone")
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

        active_caisse = self.caisse_service.get_caisse_active_db(self.db)
        now = _now()
        ref = self.generer_reference(self.vente_repo.count_mois())

        vente = Vente(
            id=int(now.strftime("%Y%m%d%H%M%S")),
            employe_id=employe.id,
            reduction=str(vdto.prixReduction or 0),
            caisse_id=active_caisse.id,
            reference=ref,
            date_vente=now,
            etat=vdto.etat,
            prix_total=(vdto.prixTotal or 0.0) - (vdto.prixReduction or 0.0),
            commentaire=vdto.commentaire,
            user_id=client.id,
            prescripteur_id=prescripteur.id,
            supprimer=0,
            date_encaissement=now,
            prix_percu=float((dto.encaissementDto or {}).get("montantPercu") or 0.0),
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
                    vente_id=vente.id, produit_id=produit_detail.id, quantite=qte,
                    prix_unit=p.prixUnit, type=p.type, reduction=p.reduction,
                ))
            else:
                er = _require(self.enrayon_repo.find_by_id(str(p.rayonId)), f"EnRayon introuvable: {p.rayonId}")
                er.quantiteRestante = _parse_int(er.quantiteRestante) - qte
                self.enrayon_repo.save(er)

                prod = _require(self.produit_repo.find_by_id(int(er.produitId)), "Produit introuvable")
                prod.stock = _parse_int(prod.stock) - qte
                self.produit_repo.save(prod)

                self.concerner_repo.save(Concerner(
                    vente_id=vente.id, produit_id=prod.id, en_rayon_id=er.id, quantite=qte,
                    prix_unit=p.prixUnit, type=p.type, reduction=p.reduction,
                ))

        # Facturation + lignes selon type
        fact = Facturation(
            id=int(self.generate_id()),
            vente_id=vente.id,
            caisse_id=active_caisse.id,
            type_paiement=(dto.encaissementDto or {}).get("typeEncaissement"),
            montant_percu=(dto.encaissementDto or {}).get("montantPercu"),
            reste=(dto.encaissementDto or {}).get("montantRendu"),
            montant_ttc=int(vente.prixTotal or 0),
            date_facture=now,
            supprimer=0,
        )
        fact = self.facturation_repo.save(fact)

        type_e = _remove_accents_lower((dto.encaissementDto or {}).get("typeEncaissement", ""))

        if type_e == "espece":
            montant = (dto.encaissementDto or {}).get("espece")
            if montant is not None:
                self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=montant))

        elif type_e == "electronique":
            el = (dto.encaissementDto or {}).get("electronique") or {}
            self.facture_electronique_repo.save(
                FactureElectronique(facturation_id=fact.id, numero_telephone=el.get("numeroTelephone"),
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
                FactureTicket(facturation_id=fact.id, ticket_caisse_id=ticket.id, montant=tk.get("montantTicket"))
            )

        elif type_e == "mixte":
            # espèces
            montant = (dto.encaissementDto or {}).get("espece")
            if montant is not None:
                self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=montant))
            # électronique
            el = (dto.encaissementDto or {}).get("electronique") or {}
            self.facture_electronique_repo.save(
                FactureElectronique(facturation_id=fact.id, numeroTelephone=el.get("numeroTelephone"),
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
                FactureTicket(facturation_id=fact.id, ticket_caisse_id=ticket.id, montant=tk.get("montantTicket"))
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

        caisse = self.caisse_service.get_caisse_active_db(self.db)
        fact = Facturation(
            id=int(self.generate_id()),
            vente_id=vente.id,
            caisse_id=caisse.id,
            type_paiement=req.typePaiement,
            montant_percu=req.montantPercu,
            reste=req.reste,
            montant_ttc=req.montantTtc,
            date_facture=_now(),
            supprimer=0,
        )
        # Lignes selon type
        t = _remove_accents_lower(req.typePaiement)
        if t == "espece" and req.espece is not None:
            self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=req.espece))
        elif t == "electronique" and req.electronique:
            self.facture_electronique_repo.save(
                FactureElectronique(facturation_id=fact.id,
                                    numero_telephone=req.electronique.numeroTelephone,
                                    montant=req.electronique.montant)
            )
        elif t == "ticket" and req.ticket is not None:
            self.facture_ticket_repo.save(FactureTicket(facturation_id=fact.id, montant=req.ticket))
        elif t == "mixte":
            if req.espece is not None:
                self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=req.espece))
            if req.electronique:
                self.facture_electronique_repo.save(
                    FactureElectronique(facturation_id=fact.id,
                                        numero_telephone=req.electronique.numeroTelephone,
                                        montant=req.electronique.montant)
                )
            if req.ticket is not None:
                self.facture_ticket_repo.save(FactureTicket(facturation_id=fact.id, montant=req.ticket))
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

        caisse = self.caisse_service.get_caisse_active_db(self.db)
        fact = Facturation(
            id=int(self.generate_id()),
            vente_id=vente.id,
            caisse_id=caisse.id,
            type_paiement=dto.typeEncaissement,
            montant_percu=dto.montantPercu,
            reste=dto.montantRendu,
            montant_ttc=int(vente.prix_total or 0),
            date_facture=_now(),
            supprimer=0,
        )
        fact = self.facturation_repo.save(fact)
        print("fact")
        print(fact.id)
        print(fact)
        if dto.typeEncaissement == "espece" and dto.espece is not None:
            self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=dto.espece))
        elif dto.typeEncaissement == "electronique" and dto.electronique:
            self.facture_electronique_repo.save(
                FactureElectronique(
                    facturation_id=fact.id,
                    numero_telephone=dto.electronique.numeroTelephone,
                    montant=dto.electronique.montantElectronique)
            )
        elif dto.typeEncaissement == "ticket" and dto.ticket:
            ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(dto.ticket.numeroTicket), "Ticket introuvable")
            ticket.type = "Encaisser"
            ticket.date_encaisser = _now()
            ticket.caisse_id_encaisser = (
                    self.caisse_service.get_caisse_active_db(self.db) or {}).id if self.caisse_service else None
            self.bon_caisse_repo.save(ticket)

            self.facture_ticket_repo.save(
                FactureTicket(facturation_id=fact.id, ticket_caisse_id=ticket.id, montant=dto.ticket.montantTicket)
            )
        elif dto.typeEncaissement == "mixte":
            if dto.espece is not None:
                self.facture_espece_repo.save(FactureEspece(facturation_id=fact.id, montant=dto.espece))
            if dto.electronique:
                self.facture_electronique_repo.save(
                    FactureElectronique(facturation_id=fact.id,
                                        numero_telephone=dto.electronique.numeroTelephone,
                                        montant=dto.electronique.montantElectronique)
                )
            if dto.ticket:
                ticket = _require(self.bon_caisse_repo.find_by_codebarre_id(dto.ticket.numeroTicket),
                                  "Ticket introuvable")
                ticket.type = "Encaisser"
                ticket.date_encaisser = _now()
                ticket.caisse_id_encaisser = (
                        self.caisse_service.get_caisse_active_db(self.db) or {}).id if self.caisse_service else None
                self.bon_caisse_repo.save(ticket)
                self.facture_ticket_repo.save(
                    FactureTicket(facturation_id=fact.id, ticket_caisse_id=ticket.id, montant=dto.ticket.montantTicket)
                )
        else:
            raise HTTPException(status_code=400, detail=f"Type de paiement non pris en charge: {dto.typeEncaissement}")

        vente.prix_percu = float(dto.montantPercu or 0.0)
        vente.date_encaissement = _now()
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
        vente = to_camel_dict(_require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable"))
        print("vente")
        print(vente)
        data = {
            "id": vente.id,
            "prixTotal": vente.prix_total,
            "prixPercu": vente.prix_percu,
            "dateVente": vente.date_vente,
            "dateEncaissement": vente.date_encaissement,
            "commentaire": vente.commentaire,
            "maladeId": vente.malade_id,
            "etat": vente.etat,
            "reference": vente.reference,
            "nouveauInfo": vente.nouveau_info,
            "userId": vente.user_id,
            "prescripteurId": vente.prescripteur_id,
            "employeId": vente.employe_id,
            "reduction": vente.reduction,
            "caisseId": vente.caisse_id,
            "supprimer": vente.supprimer,
        }
        if vente.prix_percu is not None and vente.prix_percu > 0:
            raise HTTPException(status_code=400, detail="La vente est déjà encaissée.")

        produits = []
        for c in self.concerner_repo.find_by_vente_id(int(vente.id)):
            nom, pid = None, None
            if c.type == "detail":
                pd = self.produit_detail_repo.find_by_id(int(c.en_rayon_id))
                _require(pd, "ProduitDetail introuvable")
                nom, pid = pd.nom, pd.id
            else:
                er = _require(self.enrayon_repo.find_by_id(str(c.en_rayon_id)), "EnRayon introuvable")
                p = _require(self.produit_repo.find_by_id(int(er.produit_id)), "Produit introuvable")
                nom, pid = p.nom, p.id
            produits.append({
                "id": c.id,
                "nom": nom,
                "prixUnitaire": c.prix_unit,
                "quantite": c.quantite,
                "prixTotal": _parse_int(c.prix_unit) * _parse_int(c.quantite),
                "reduction": c.reduction,
                "type": c.type,
            })
        return {"vente": data, "produits": produits}

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
                "netAPayer": v.prix_total,
                "reduction": v.reduction,
                "reference": v.reference,
                "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
                "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
                "commentaire": v.commentaire,
                "dateVente": v.date_vente,
                "actions": "edit,delete",
            })
        return out

    # ---------------------------------------------------------------------
    # listerVenteParNombreDeJourEtFournisseur(fournisseurId, jour)
    # ---------------------------------------------------------------------
    def lister_vente_par_nombre_de_jour_et_fournisseur(self, fournisseur_id: Optional[str], jour: int) -> List[
        Dict[str, Any]]:
        date_debut = _now() - timedelta(days=jour)
        date_fin = _now()
        ventes = self.vente_repo.find_by_date_vente_between_and_supprimer(date_debut, date_fin)

        produits: List[Dict[str, Any]] = []
        for v in ventes:
            for c in self.concerner_repo.find_by_vente_id(int(v.id)):
                if _parse_int(c.en_rayon_id) > 1000:
                    er = self.enrayon_repo.find_by_id(str(c.en_rayon_id))
                    p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
                    if not p or not er:
                        continue
                    if fournisseur_id == "null":
                        fournisseur = self.fournis_repo.find_by_id(int(er.fournisseur_id))
                        produits.append({
                            "id": p.id, "nom": p.nom, "prix": c.prix_unit, "stock": p.stock,
                            "fournisseur": fournisseur.nom if fournisseur else None,
                            "dateLivraison": er.date_livraison, "datePeremption": er.date_peremption,
                            "quantiteStock": p.stock, "prixAchat": er.prix_achat, "quantiteRestante": 0,
                        })
                    elif fournisseur_id and int(fournisseur_id) > 0:
                        if er.fournisseur_id and int(er.fournisseur_id) == int(fournisseur_id):
                            fournisseur = self.fournis_repo.find_by_id(int(fournisseur_id))
                            produits.append({
                                "id": p.id, "nom": p.nom, "prix": c.prix_unit, "stock": p.stock,
                                "fournisseur": fournisseur.nom, "dateLivraison": er.date_livraison,
                                "datePeremption": er.date_peremption, "quantiteStock": p.stock,
                                "prixAchat": er.prix_achat, "quantiteRestante": 0,
                            })
                    else:
                        fournisseur = self.fournis_repo.find_by_id(int(er.fournisseur_id))
                        produits.append({
                            "id": p.id, "nom": p.nom, "prix": c.prix_unit, "stock": p.stock,
                            "fournisseur": fournisseur.nom if fournisseur else None,
                            "dateLivraison": er.date_livraison, "datePeremption": er.date_peremption,
                            "quantiteStock": p.stock, "prixAchat": er.prix_achat, "quantiteRestante": 0,
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
    def lister_ventes_non_encaissees(self, page: int, size: int, sort: str, direction: str, search: Optional[str]) -> \
            Dict[str, Any]:
        page, size = _page_sizing(page, size)
        caisse = self.caisse_service.get_caisse_active_db(self.db)
        if not caisse:
            return {"content": [], "totalElements": 0, "totalPages": 0, "pageSize": size, "pageNumber": page}

        rows, total = self.vente_repo.filter_ventes(supprimer=0, active_caisse=caisse, prix_percu=0,
                                                    etat="null", date_vente="null", date_encaissement="null",
                                                    user_id="null", employe_id="null", prescripteur_id="null",
                                                    caisse_id="null",
                                                    page=page, size=size, sort_by="date_vente", direction="DESC")
        content = [{
            "id": v.id, "netAPayer": v.prix_total, "reduction": v.reduction, "reference": v.reference,
            "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
            "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
            "commentaire": v.commentaire, "dateVente": v.date_vente, "actions": "edit,delete",
        } for v in rows]
        return {
            "content": content, "totalElements": total,
            "totalPages": (total + size - 1) // size, "pageSize": size, "pageNumber": page
        }

    # ---------------------------------------------------------------------
    # listerVentesEncaissees(pageable) -> Page<Map>
    # ---------------------------------------------------------------------
    def lister_ventes_encaissees(self, page: int, size: int, sort: str, direction: str, search: Optional[str]) -> Dict[
        str, Any]:
        page, size = _page_sizing(page, size)
        caisse = self.caisse_service.get_caisse_active_db(self.db)
        rows, total = self.vente_repo.filter_ventes(supprimer=0, active_caisse=caisse, prix_percu=0,
                                                    etat="null", date_vente="null", date_encaissement="null",
                                                    user_id="null", employe_id="null", prescripteur_id="null",
                                                    caisse_id="null",
                                                    page=page, size=size, sort_by="date_vente", direction="DESC")
        content = [{
            "id": v.id, "prixPercu": v.prix_percu, "netAPayer": v.prix_total, "reduction": v.reduction,
            "reference": v.reference,
            "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
            "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
            "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.date_vente,
            "dateEncaissement": v.date_encaissement, "actions": "edit,delete",
        } for v in rows]
        return {
            "content": content, "totalElements": total,
            "totalPages": (total + size - 1) // size, "pageSize": size, "pageNumber": page
        }

    # ---------------------------------------------------------------------
    # listerVentesCreditNonEncaissees(pageable)
    # ---------------------------------------------------------------------
    def lister_ventes_credit_non_encaissees(self, page: int, size: int, sort: str, direction: str,
                                            search: Optional[str]) -> Dict[str, Any]:
        page, size = _page_sizing(page, size)
        rows, total = self.vente_repo.filter_ventes(active_caisse=None, prix_percu=0,
                                                    etat="CREDIT", date_vente="null", date_encaissement="null",
                                                    user_id="null", employe_id="null", prescripteur_id="null",
                                                    caisse_id="null",
                                                    supprimer=0,
                                                    page=page, size=size, sort_by="date_vente", direction="DESC")
        content = []
        for v in rows:
            produits = []
            for c in self.concerner_repo.find_by_vente_id(int(v.id)):
                if c.type == "detail":
                    pd = self.produit_detail_repo.find_by_id(int(c.en_rayon_id))
                    nom, pid = pd.nom, pd.id
                else:
                    er = self.enrayon_repo.find_by_id(str(c.en_rayon_id))
                    p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
                    nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
                produits.append({
                    "id": c.id, "nom": nom, "produitId": pid, "quantite": c.quantite,
                    "prixUnitaire": c.prix_unit, "reduction": c.reduction,
                    "prixTotal": _parse_int(c.prix_unit) * _parse_int(c.quantite),
                })
            content.append({
                "id": v.id, "prixPercu": v.prix_percu, "netAPayer": v.prix_total, "reduction": v.reduction,
                "reference": v.reference,
                "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
                "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
                "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.date_vente,
                "dateEncaissement": v.date_encaissement, "produits": produits, "actions": "edit,delete",
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
        data = {
            "id": vente.id,
            "prixTotal": vente.prix_total,
            "prixPercu": vente.prix_percu,
            "dateVente": vente.date_vente,
            "dateEncaissement": vente.date_encaissement,
            "commentaire": vente.commentaire,
            "maladeId": vente.malade_id,
            "etat": vente.etat,
            "reference": vente.reference,
            "nouveauInfo": vente.nouveau_info,
            "userId": vente.user_id,
            "prescripteurId": vente.prescripteur_id,
            "employeId": vente.employe_id,
            "reduction": vente.reduction,
            "caisseId": vente.caisse_id,
            "supprimer": vente.supprimer,
            "user": vente.user,
            "caisse": vente.caisse,
            "prescripteur": vente.prescripteur,
            "employe": vente.employe,
        }
        if vente.prix_percu is None or vente.prix_percu <= 0:
            # NB: le code Kotlin a une condition inversée / message ambigu
            raise HTTPException(status_code=400, detail="La vente n'est pas encore encaissée.")
        produits = []
        for c in self.concerner_repo.find_by_vente_id(int(vente.id)):
            if c.type == "detail":
                pd = self.produit_detail_repo.find_by_id(int(c.en_rayon_id))
                nom = pd.nom
            else:
                er = self.enrayon_repo.find_by_id(str(c.en_rayon_id))
                p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
                nom = getattr(p, "nom", None)
            produits.append({
                "id": c.id, "nom": nom, "prixUnitaire": c.prix_unit, "quantite": c.quantite,
                "prixTotal": _parse_int(c.prix_unit) * _parse_int(c.quantite), "reduction": c.reduction,
            })
        facturation = self.facturation_repo.find_by_vente(vente)
        t = _remove_accents_lower(getattr(facturation, "typePaiement", "") or "")

        montant_espece = self.facture_espece_repo.find_by_facturation_id(facturation.id).montant if t in (
            "espece", "mixte") else 0
        el = self.facture_electronique_repo.find_by_facturation_id(facturation.id) if t in (
            "electronique", "mixte") else None
        montant_electronique = getattr(el, "montant", 0)
        tk = self.facture_ticket_repo.find_by_facturation_id(facturation.id) if t in ("ticket", "mixte") else None
        montant_ticket = getattr(tk, "montant", 0)

        return {
            "vente": data,
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
                pd = self.produit_detail_repo.find_by_id(int(c.en_rayon_id))
                nom, pid = pd.nom, pd.id
            else:
                er = self.enrayon_repo.find_by_id(str(c.en_rayon_id))
                p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
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
                er = self.enrayon_repo.find_by_id(str(c.en_rayon_id))
                p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
                nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
            produits.append({
                "id": c.id, "nom": nom, "produitId": pid, "rayonId": c.en_rayon_id,
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
        caisse = self.caisse_service.get_caisse_active_db(self.db)
        vente = _require(self.vente_repo.find_by_id(int(vente_id)), "Vente introuvable")
        vente.caisse = caisse
        return self.vente_repo.save(vente)

    # ---------------------------------------------------------------------
    # listerVentesPageableDetail(pageable,...)
    # ---------------------------------------------------------------------
    def lister_ventes_pageable_detail(
            self,
            *,
            page: int,
            size: int,
            sort: str = "dateVente",
            direction: str = "DESC",
            etat: Optional[str] = None,
            startDateVente: Optional[str] = None, endDateVente: Optional[str] = None,
            startDateEncaissement: Optional[str] = None, endDateEncaissement: Optional[str] = None,
            userId: Optional[str] = None, employeId: Optional[str] = None,
            prescripteurId: Optional[str] = None, caisseId: Optional[str] = None,
            search: Optional[str] = None,
    ) -> Dict[str, Any]:

        active_caisse = self.caisse_service.get_caisse_active_db(self.db)
        if caisseId == "non":
            active_caisse = None

        rows, total = self.vente_repo.filter_ventes_range(
            supprimer=0,
            active_caisse=active_caisse, prix_percu=None, etat=etat,
            start_date_vente=startDateVente, end_date_vente=endDateVente,
            start_date_encaissement=startDateEncaissement, end_date_encaissement=endDateEncaissement,
            user_id=userId, employe_id=employeId, prescripteur_id=prescripteurId, caisse_id=caisseId,
            page=page, size=size,
            sort_by="dateVente", direction="DESC",
        )
        print("rows")
        print(rows)

        def _map(v: Vente) -> Dict[str, Any]:
            produits = []
            print("v")
            print(v.date_encaissement)
            print(v.date_vente)
            for c in self.concerner_repo.find_by_vente_id(int(v.id)):
                if c.type == "detail":
                    pd = self.produit_detail_repo.find_by_id(int(getattr(c, "en_rayon_id", 0)))
                    nom, pid = pd.nom, pd.id
                else:
                    er = self.enrayon_repo.find_by_id(int(getattr(c, "en_rayon_id", 0)))
                    p = self.produit_repo.find_by_id(int(er.produit_id)) if er else None
                    nom, pid = getattr(p, "nom", None), getattr(p, "id", None)
                    prix_unit = getattr(c, "prix_unit",
                                        getattr(c, "prixUnit", 0))  # tolérance si le champ n’a pas encore été renommé
                    produits.append({
                        "id": c.id, "nom": nom, "produitId": pid, "quantite": c.quantite,
                        "prixUnitaire": prix_unit, "reduction": c.reduction,
                        "prixTotal": _parse_int(prix_unit) * _parse_int(c.quantite),
                    })
            return {
                "id": v.id, "prixPercu": v.prix_percu, "netAPayer": v.prix_total, "reduction": v.reduction,
                "reference": v.reference,
                "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
                "vendeur": getattr(getattr(v.employe, "user", None), "nom", "Inconnu"),
                "commentaire": v.commentaire, "etat": v.etat, "dateVente": v.date_vente,
                "dateEncaissement": v.date_encaissement, "produits": produits, "actions": "edit,delete",
            }

        content = [_map(v) for v in rows]

        # totalAmount global (requête complète non paginée)
        total_amount = 0.0
        if total > 0:
            all_rows, _ = self.vente_repo.filter_ventes_range(
                supprimer=0,
                active_caisse=active_caisse, prix_percu=0, etat=etat,
                start_date_vente=startDateVente, end_date_vente=endDateVente,
                start_date_encaissement=startDateEncaissement, end_date_encaissement=endDateEncaissement,
                user_id=userId, employe_id=employeId, prescripteur_id=prescripteurId, caisse_id=caisseId,
                page=0, size=total, sort_by="date_vente", direction="DESC")
            total_amount = sum((r.prix_total or 0.0) for r in all_rows)

        # return VentePageableCustomlDto(
        #   content=content,
        #   totalElements=total,
        #   totalPages=(total + size - 1) // size if size else 1,
        #   pageSize=size,
        #   pageNumber=page,
        #   totalAmount=total_amount,
        #   data={},
        # )
        return {
            "content": {
                "content": content,
                "totalElements": total,
                "totalPages": (total + size - 1) // size if size else 1,
                "pageSize": size,
                "totalAmount": total_amount,
                "pageNumber": page,
            },
            "totalElements": total,
            "totalPages": (total + size - 1) // size if size else 1,
            "pageSize": size,
            "totalAmount": total_amount,
            "pageNumber": page,
        }

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
            c.drawString(15 * mm, y, " | ".join(headers));
            y -= 6 * mm

            # on recharge toutes les lignes pour le print
            # (page=0, size=totalElements)
            content = res["content"]["content"]
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
                for v in res["content"]["content"]:
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
        active_caisse = self.caisse_service.get_caisse_active_db(db=self.db)
        if caisseId == "non":
            active_caisse = None

        rows, total = self.vente_repo.filter_ventes_range(
            supprimer=0,
            active_caisse=active_caisse, prix_percu=0, etat=etat,
            start_date_vente=startDateVente, end_date_vente=endDateVente,
            start_date_encaissement=startDateEncaissement, end_date_encaissement=endDateEncaissement,
            user_id=userId, employe_id=employeId, prescripteur_id=prescripteurId, caisse_id=caisseId,
            page=page, size=size, sort_by="date_vente", direction="DESC"
        )
        content: List[Dict[str, Any]] = []
        for v in rows:
            enrayons = self.enrayon_repo.find_all_by_produit_id_and_supprimer(int(produitId)) if produitId else []
            concerner_list = self.concerner_repo.find_by_vente_id_and_en_rayon_id_in(int(v.id),
                                                                                     [e.id for e in enrayons])
            if concerner_list:
                d: Dict[str, Any] = {
                    "venteId": v.id,
                    "prixPercu": v.prix_percu,
                    "netAPayer": v.prix_total,
                    "reference": v.reference,
                    "commentaire": v.commentaire,
                    "etat": v.etat,
                    "date": v.date_vente,
                    "dateEncaissement": v.date_encaissement,
                    "produits": [{"quantite": c.quantite, "prix_unitaire": c.prixUnit, "reduction": c.reduction}
                                 for c in concerner_list],
                    "quantite": sum(_parse_int(c.quantite) for c in concerner_list),
                    "prixUnitaire": sum(_parse_int(c.prixUnit) for c in concerner_list),
                    "reduction": sum(_parse_int(c.reduction) for c in concerner_list),
                    "prixVente": v.prix_total,
                    "prixTotal": sum(_parse_int(c.quantite) * _parse_int(c.prixUnit) for c in concerner_list),
                    "infoClients": f"{v.user.nom} ({v.user.telephone})" if v.user else "Aucun client",
                    "vendeur": (getattr(getattr(v.employe, "user", None), "nom", None) or "Invonnu"),
                    "actions": "edit,delete",
                }
                content.append(d)

        # agrégats globaux
        prix_vente_total = sum(_parse_int(row.get("prix_total")) for row in content)
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
