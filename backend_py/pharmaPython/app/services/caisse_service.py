from datetime import datetime, time, date
from typing import Optional

from fastapi_pagination import paginate
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException

from app.core.pagination import Page
from app.models.caisse import Caisse
from app.schemas.caisse_dto import CaisseOuvertureRequestDto, CaisseDto


class CaisseService:

  def __init__(self, db: Session, user_utils, repos):
    self.db = db
    self.user_utils = user_utils
    # repos est un dict contenant tous les repositories
    self.caisse_repo = repos["caisse"]
    self.boncaisse_repo = repos["boncaisse"]
    self.retour_repo = repos["retour_produit"]
    self.depense_repo = repos["depense"]
    self.vente_repo = repos["vente"]
    self.employe_repo = repos["employe"]
    self.produit_retour_repo = repos["produit_retour"]
    self.concerner_repo = repos["concerner"]
    self.facturation_repo = repos["facturation"]
    self.facture_espece_repo = repos["facture_espece"]
    self.facture_ticket_repo = repos["facture_ticket"]
    self.facture_elec_repo = repos["facture_electronique"]
    self.enrayon_repo = repos["enrayon"]
    self.produit_repo = repos["produit"]
    self.produit_detail_repo = repos["produit_detail"]

  # === Vérifications d'état ===
  def is_caisse_ouverte(self) -> bool:
    return self.db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).count() > 0

  def get_last_caisse(self):
    return self.db.query(Caisse).order_by(Caisse.id.desc()).first()

  def get_caisse_active(self):
    return self.db.query(Caisse).filter(Caisse.etat == "Ouvert", Caisse.supprimer == 0).first()

  def get_caisse_fermer(self):
    return self.db.query(Caisse).filter(Caisse.etat == "Clot", Caisse.supprimer == 0).first()

  def get_caisse_en_cours(self):
    return self.db.query(Caisse).filter(Caisse.etat == "En cours", Caisse.supprimer == 0).first()

  def get_caisse_attente_cloture(self):
    return self.db.query(Caisse).filter(Caisse.etat == "En cours1", Caisse.supprimer == 0).first()

  # === Ouvrir une caisse ===
  def ouvrir_caisse(self, request: CaisseOuvertureRequestDto) -> CaisseDto:
    employe = self.user_utils.get_current_employe()
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
  def cloturer_caisse(self, fond_caisse_ferme: float, fermeture_caisse: str) -> CaisseDto:
    employe_id = self.user_utils.get_current_employe_id()
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
  def mettre_caisse_en_attente(self) -> CaisseDto:
    employe_id = self.user_utils.get_current_employe_id()
    caisse = self.get_caisse_active()
    if caisse and caisse.user_id == employe_id:
      caisse.etat = "En cours"
      self.db.commit()
      self.db.refresh(caisse)
      return self.map_to_dto(caisse)
    raise HTTPException(status_code=403, detail="Non autorisé ou aucune caisse trouvée")

  # === Ouvrir une nouvelle caisse ===
  def ouvrir_nouvelle_caisse(self, request: CaisseOuvertureRequestDto) -> CaisseDto:
    employe = self.user_utils.get_current_employe()
    active = self.get_caisse_active()
    en_cours = self.db.query(Caisse).filter(
      Caisse.user_id == employe.id, Caisse.etat == "En cours", Caisse.supprimer == 0
    ).first()
    if active or en_cours:
      raise HTTPException(status_code=400, detail="Impossible d’ouvrir une nouvelle caisse")

    caisse = Caisse(
      user_id=employe.id,
      fond_caisse_ouvert=float(request.fond_caisse_ouvert or 0),
      ouverture_caisse=request.ouverture_caisse or "",
      date_ouvert=datetime.now(),
      session=self.generer_session_id(),
      etat="Ouvert",
      supprimer=0
    )
    self.db.add(caisse)
    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)

  # === Générer rapport caisse ===
  def generate_caisse_report(self, caisse_id: int):
    caisse = self.db.query(Caisse).get(caisse_id)
    if not caisse:
      raise HTTPException(status_code=404, detail="Caisse introuvable")

    # Simplifié : tu peux implémenter la logique complète comme en Kotlin
    ventes = self.vente_repo.find_by_caisse_id(caisse_id)
    depenses = self.depense_repo.find_by_caisse_id(caisse_id)

    return {
      "caisse": caisse,
      "ventes": ventes,
      "depenses": depenses,
      "total_ventes": sum(v.prix_total for v in ventes),
      "total_depenses": sum(d.montant for d in depenses)
    }

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
      employeNom=f"{caisse.user.user.prenom if caisse.user else ''} {caisse.user.user.nom if caisse.user else ''}".strip(),
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

  def get_all_caisses(self, page: int = 0, size: int = 10) -> Page[Caisse]:
    query = self.db.query(Caisse).order_by(Caisse.date_ouvert.desc())
    return paginate(query.all())

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
    self):
    employe_id = self.user_utils.get_current_employe_id()
    caisse = self.get_caisse_active()

    if not caisse:
      raise HTTPException(status_code=404, detail="Aucune caisse active trouvée")

    if caisse.user_id != employe_id:
      raise HTTPException(status_code=403, detail="Vous n’êtes pas autorisé à modifier cette caisse")

    caisse.etat = "En cours1"  # état "attente de clôture"
    self.db.commit()
    self.db.refresh(caisse)
    return self.map_to_dto(caisse)
