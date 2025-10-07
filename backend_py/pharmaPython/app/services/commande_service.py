from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.models.commandeout import Commande
from app.models.employe import Employe
from app.models.en_rayon import EnRayon
from app.models.produit_cmd import ProduitCmd
from app.repositories.commande_repository import CommandeRepository
from app.repositories.employe_repository import EmployeRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.fournisseur_repository import FournisseurRepository
from app.repositories.produit_cmd_repository import ProduitCmdRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.user_repository import UserRepository
from app.schemas.commande_dto import CommandeRequest, CommandePageableCustomlDto, CommandeNewDTO, ProduitCmdRequest, \
  CommandeRuptureRequest
from app.utility.user_utils import UserUtils


class CommandeService:
  def __init__(
    self,
    db: Session
  ):
    self.db = db
    self.employe_repo = EmployeRepository(db)
    self.produit_cmd_repo = ProduitCmdRepository(db)
    self.fournisseur_repo = FournisseurRepository(db)
    self.commande_repo = CommandeRepository(db)
    self.produit_repo = ProduitRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.user_repo = UserRepository(db)
    self.user_utils = UserUtils

  # ----------------------------
  # Créer une commande simple
  # ----------------------------
  def create_commande(self, request: CommandeRequest) -> Commande:
    if not request.produits:
      raise HTTPException(status_code=400, detail="La commande doit contenir au moins un produit.")

    quantite_totale = sum([p.quantite for p in request.produits])
    montant_total = sum([p.quantite * p.prixAchat for p in request.produits])

    commande = Commande(
      employe_id=request.employeId,
      fournisseur_id=request.fournisseurId,
      date_creation=datetime.utcnow(),
      ref=self.generer_reference_commande(self.commande_repo.count_mois()),
      qtite_cmd=quantite_totale,
      montant_cmd=montant_total,
      etat=request.type,
      supprimer=0
    )

    self.db.add(commande)
    self.db.flush()

    for produit_request in request.produits:
      produit = self.produit_repo.find_by_id(produit_request.id)
      if not produit:
        raise HTTPException(status_code=404, detail=f"Produit non trouvé {produit_request.id}")

      produit_cmd = ProduitCmd(
        commande_id=commande.id,
        produit_id=produit.id,
        pu_recept=produit_request.prixUnitaire or 0,
        qtite_cmd=produit_request.quantite,
        qtite_recu=produit_request.quantiteRecu or 0,
        pu_cmd=produit_request.prixAchat or 0,
        prix_public=produit_request.prixVente or 0,
        unite_gratuite=produit_request.uniteGratuite or 0
      )
      self.db.add(produit_cmd)

    self.db.commit()
    return commande

  # ----------------------------
  # Annuler une commande
  # ----------------------------
  def annuler_commande(self, commande_id: int) -> Commande:
    commande = self.commande_repo.find_by_id(commande_id)
    if not commande:
      raise HTTPException(status_code=404, detail="Commande non trouvée")
    commande.etat = "annulee"
    self.db.commit()
    return commande

  # ----------------------------
  # Livrer une commande
  # ----------------------------
  def livrer_commande(self, commande_id: int) -> Commande:
    commande = self.commande_repo.find_by_id(commande_id)
    if not commande:
      raise HTTPException(status_code=404, detail="Commande non trouvée")

    commande.etat = "livree"
    commande.date_livraison = datetime.utcnow()
    self.db.commit()
    return commande

  # ----------------------------
  # Récupérer toutes les commandes mappées
  # ----------------------------
  def get_all_commandes_mapped(self) -> List[Dict[str, Any]]:
    commandes = self.commande_repo.find_all()
    return [
      {
        "id": c.id,
        "ref": c.ref,
        "dateCreation": c.date_creation,
        "etat": c.etat,
        "qtiteCmd": c.qtite_cmd,
        "qtiteRecu": c.qtite_recu,
        "montantRecu": c.montant_recu,
        "uniteGratuite": c.unite_gratuite,
        "fournisseur": c.fournisseur.nom if c.fournisseur else None,
        "montantCmd": c.montant_cmd
      }
      for c in commandes
    ]

  # ----------------------------
  # Récupérer une commande par ID
  # ----------------------------
  def get_commande_by_id(self, commande_id: int) -> Dict[str, Any]:
    commande = self.commande_repo.find_by_id(commande_id)
    if not commande:
      raise HTTPException(status_code=404, detail="Commande non trouvée")

    return {
      "id": commande.id,
      "dateCreation": commande.date_creation,
      "dateLivraison": commande.date_livraison,
      "fournisseur": commande.fournisseur.nom if commande.fournisseur else None,
      "reference": commande.ref,
      "etat": commande.etat,
      "montantTotal": commande.montant_cmd,
      "qtiteRecu": commande.qtite_recu,
      "qtiteCmd": commande.qtite_cmd,
      "uniteGratuite": commande.unite_gratuite,
      "note": commande.note
    }

  # ----------------------------
  # Générer une référence unique
  # ----------------------------
  def generer_reference_commande(self, num: int) -> str:
    now = datetime.utcnow()
    annee = now.strftime("%Y")
    mois = now.strftime("%m")
    return f"ALS{annee}{mois}COM{num + 1:04d}"

    # ---------- util ----------

  def _recalc_totaux(self, commande: Commande):
    lignes = self.produit_cmd_repo.find_by_commande_id(commande.id)
    commande.qtite_cmd = sum((l.qtite_cmd or 0) for l in lignes)
    commande.qtite_recu = sum((l.qtite_recu or 0) for l in lignes)
    commande.unite_gratuite = sum((l.unite_gratuite or 0) for l in lignes)
    # Montants: cmd (PU commande * qte_cmd), recu (PU réception * qte_recu)
    commande.montant_cmd = float(sum((l.pu_cmd or 0) * (l.qtite_cmd or 0) for l in lignes))
    commande.montant_recu = float(sum((l.pu_recept or 0) * (l.qtite_recu or 0) for l in lignes))
    self.db.commit()
    self.db.refresh(commande)

  def generer_reference_commande(self, num_mois: int) -> str:
    now = datetime.utcnow()
    return f"ALS{now:%Y}{now:%m}COM{num_mois + 1:04d}"

    # ---------- déjà fournis ailleurs (rappel) ----------

  def get_all_commandes_mapped(self) -> List[Dict[str, Any]]:
    commandes = self.commande_repo.find_all()
    return [
      {
        "id": c.id, "ref": c.ref, "dateCreation": c.date_creation,
        "etat": c.etat, "qtiteCmd": c.qtite_cmd, "qtiteRecu": c.qtite_recu,
        "montantRecu": c.montant_recu, "uniteGratuite": c.unite_gratuite,
        "fournisseur": c.fournisseur.nom if getattr(c, "fournisseur", None) else None,
        "montantCmd": c.montant_cmd
      } for c in commandes
    ]

    # ---------- manquantes : implémentations complètes ----------

  def receptionner_commande(self, id_: int, receptionType: str, produits: List[ProduitCmdRequest]) -> Commande:
    """
    Réceptionne (tout ou partiel) une commande :
    - Met à jour qtite_recu, pu_recept, date_peremption, unite_gratuite par ligne
    - Ajoute le stock (EnRayon) pour chaque produit reçu
    - Met l'état de la commande à 'RECEP_PARCIALE' ou 'RECEP_TOTALE'
    """
    commande = self.commande_repo.find_by_id(id_)
    if not commande or commande.supprimer == 1:
      raise HTTPException(status_code=404, detail="Commande non trouvée")

    lignes = {l.id: l for l in self.produit_cmd_repo.find_by_commande_id(commande.id)}

    for item in produits:
      if not item.productCmdId:
        continue
      ligne = lignes.get(int(item.productCmdId))
      if not ligne:
        raise HTTPException(status_code=404, detail=f"Ligne commande {item.productCmdId} introuvable")

      # Mises à jour des quantités et prix de réception
      if item.quantiteRecu is not None:
        ligne.qtite_recu = (ligne.qtite_recu or 0) + int(item.quantiteRecu)
      if item.prixAchat is not None:
        ligne.pu_recept = float(item.prixAchat)
      if item.dateDePeremption:
        ligne.date_peremption = item.dateDePeremption
      if item.uniteGratuite is not None:
        ligne.unite_gratuite = int(item.uniteGratuite)

      self.db.add(ligne)

      # Mouvement stock
      if ligne.qtite_recu and ligne.qtite_recu > 0:
        self.enrayon_repo.add_mouvement(ligne.produit_id, ligne.qtite_recu)

    self.db.commit()

    # Recalcul totaux
    self._recalc_totaux(commande)

    # Etat
    toutes = self.produit_cmd_repo.find_by_commande_id(commande.id)
    if all((l.qtite_recu or 0) >= (l.qtite_cmd or 0) for l in toutes):
      commande.etat = "RECEP_TOTALE"
    elif any((l.qtite_recu or 0) > 0 for l in toutes):
      commande.etat = "RECEP_PARCIALE"
    else:
      commande.etat = "EN_COURS"

    commande.date_livraison = datetime.utcnow()
    self.db.commit();
    self.db.refresh(commande)
    return commande

  def get_all_commandes_mapped_pageable(
    self,
    page: int, size: int,
    etat: Optional[str],
    fournisseurId: Optional[str],
    typeFournisseur: Optional[str],  # non utilisé ici, garde si nécessaire
    startDate: Optional[str],
    endDate: Optional[str],
  ) -> Dict[str, Any]:

    rows, total = self.commande_repo.filter_commande_range(
      etat=etat,
      fournisseurId=fournisseurId,
      typeFournisseur=typeFournisseur,
      startDate=startDate,
      endDate=endDate,
      supprimer=0,
      page=page, size=size)

    content: List[Dict[str, Any]] = []
    total_amount_cmd = 0.0
    total_amount_recu = 0.0
    total_qte_cmd = 0
    total_qte_recu = 0

    for c in rows:
      content.append({
        "id": c.id,
        "ref": c.ref,
        "etat": c.etat,
        "dateCreation": c.date_creation,
        "dateLivraison": c.date_livraison,
        "fournisseur": c.fournisseur.nom if getattr(c, "fournisseur", None) else None,
        "montantCmd": c.montant_cmd,
        "montantRecu": c.montant_recu,
        "qtiteCmd": c.qtite_cmd,
        "qtiteRecu": c.qtite_recu,
      })
      total_amount_cmd += float(c.montant_cmd or 0)
      total_amount_recu += float(c.montant_recu or 0)
      total_qte_cmd += int(c.qtite_cmd or 0)
      total_qte_recu += int(c.qtite_recu or 0)

    total_pages = (total + size - 1) // size if size else 1

    return {
      "content": {
        "content": content,
        "totalElements": total,
        "totalPages": total_pages,
        "pageSize": size,
        "pageNumber": page,
        "totalAmountRecu": total_amount_recu,
        "totalAmountCommande": total_amount_cmd,
        "totalQteRecu": total_qte_recu,
        "totalQteCommande": total_qte_cmd
      },
      "totalElements": total,
      "totalPages": total_pages,
      "pageSize": size,
      "pageNumber": page,
      "totalAmountRecu": total_amount_recu,
      "totalAmountCommande": total_amount_cmd,
      "totalQteRecu": total_qte_recu,
      "totalQteCommande": total_qte_cmd
    }

  def modifier_lignes_commande(self, id_: int, produits: List[ProduitCmdRequest]) -> Commande:
    commande = self.commande_repo.find_by_id(id_)
    if not commande or commande.supprimer == 1:
      raise HTTPException(status_code=404, detail="Commande non trouvée")
    lignes_by_id = {l.id: l for l in self.produit_cmd_repo.find_by_commande_id(commande.id)}

    for item in produits:
      if item.productCmdId and item.productCmdId in lignes_by_id:
        l = lignes_by_id[item.productCmdId]
        if item.quantite is not None: l.qtite_cmd = int(item.quantite)
        if item.prixAchat is not None: l.pu_cmd = float(item.prixAchat)
        if item.prixVente is not None: l.prix_public = float(item.prixVente)
        if item.dateDePeremption: l.date_peremption = item.dateDePeremption
        self.db.add(l)

    self.db.commit()
    self._recalc_totaux(commande)
    return commande

  def commande_by_fournisseur(self, fournisseurId: Optional[str], totalAmount: str,
                              produits: List[CommandeNewDTO]) -> Commande:
    if not produits:
      raise HTTPException(status_code=400, detail="Aucun produit")
    fournisseur = None
    if fournisseurId:
      try:
        fournisseur = self.fournisseur_repo.find_by_id(int(fournisseurId))
      except:
        fournisseur = None

    cmd = Commande(
      fournisseur_id=(fournisseur.id if fournisseur else None),
      date_creation=datetime.utcnow(),
      ref=self.generer_reference_commande(self.commande_repo.count_mois()),
      etat="EN_COURS",
      supprimer=0
    )
    self.db.add(cmd);
    self.db.commit();
    self.db.refresh(cmd)

    for p in produits:
      pc = ProduitCmd(
        commande_id=cmd.id,
        produit_id=p.id,
        qtite_cmd=p.stock or 0,
        pu_cmd=float(p.prixAchat or 0),
        prix_public=float(p.prix or 0),
      )
      self.db.add(pc)
    self.db.commit()

    self._recalc_totaux(cmd)
    return cmd

  def commande_by_fournisseur_and_rupture(self, fournisseurId: Optional[str], totalAmount: str,
                                          produits: List[CommandeNewDTO]) -> Commande:
    if not produits:
      raise HTTPException(status_code=400, detail="Aucun produit")
    fournisseur = None
    if fournisseurId:
      try:
        fournisseur = self.fournisseur_repo.find_by_id(int(fournisseurId))
      except:
        fournisseur = None

    cmd = Commande(
      fournisseur_id=(fournisseur.id if fournisseur else None),
      date_creation=datetime.utcnow(),
      ref=self.generer_reference_commande(self.commande_repo.count_mois()),
      etat="EN_COURS",
      supprimer=0
    )
    self.db.add(cmd);
    self.db.commit();
    self.db.refresh(cmd)

    for p in produits:
      pc = ProduitCmd(
        commande_id=cmd.id,
        produit_id=p.id,
        qtite_cmd=p.stock or 0,
        pu_cmd=float(p.prixAchat or 0),
        prix_public=float(p.prix or 0),
      )
      self.db.add(pc)
    self.db.commit()

    self._recalc_totaux(cmd)
    return cmd

  def supprimer_commande(self, id_: int):
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    cmd.supprimer = 1
    self.db.commit()

  def ajouter_fournisseur(self, id_: int, fournisseurId: int) -> Commande:
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    four = self.fournisseur_repo.find_by_id(fournisseurId)
    if not four: raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    cmd.fournisseur_id = four.id
    self.db.commit();
    self.db.refresh(cmd)
    return cmd

  def imprimer_bon_pdf(self, id_: int) -> bytes:
    """
    Génère le contenu PDF du bon de commande (ici: placeholder).
    Remplace par une vraie génération (WeasyPrint, ReportLab, etc.)
    """
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    lignes = self.produit_cmd_repo.find_by_commande_id(cmd.id)
    contenu = f"BON DE COMMANDE\nREF: {cmd.ref}\n" + "\n".join(
      f"- Ligne #{l.id}  produit={l.produit_id}  qte={l.qtite_cmd}  PU={l.pu_cmd}"
      for l in lignes
    )
    return contenu.encode("utf-8")

  def reception_complementaire(self, id_: int, produits: List[ProduitCmdRequest]) -> Commande:
    """
    Réception partielle supplémentaire sur commande existante.
    Même logique que receptionner_commande mais on n’écrase pas les quantités reçues : on les *ajoute*.
    """
    return self.receptionner_commande(id_=id_, receptionType="COMPLEMENT", produits=produits)

  def ajouter_justificatif(self, id_: int, justificatif: str) -> Commande:
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    cmd.justificatif = justificatif
    self.db.commit();
    self.db.refresh(cmd)
    return cmd

  def visualiser_historique_reception(self, id_: int) -> List[Dict[str, Any]]:
    """
    Retourne l'historique de réception basé sur les lignes (dates peremption, quantités reçues, pu_recept).
    S’il existe une table dédiée aux historiques, remplace la source ici.
    """
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    lignes = self.produit_cmd_repo.find_by_commande_id(cmd.id)
    hist: List[Dict[str, Any]] = []
    for l in lignes:
      hist.append({
        "produitId": l.produit_id,
        "qtiteRecu": l.qtite_recu,
        "puRecept": l.pu_recept,
        "datePeremption": l.date_peremption,
        "dateReception": cmd.date_livraison
      })
    return hist

  def cloturer_commande(self, id_: int) -> Dict[str, Any]:
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    self._recalc_totaux(cmd)
    # Conditions de clôture minimales (reception au moins 1 ? adapte si besoin)
    cmd.etat = "CLOTUREE"
    cmd.date_livraison = cmd.date_livraison or datetime.utcnow()
    self.db.commit();
    self.db.refresh(cmd)
    return {"id": cmd.id, "etat": cmd.etat, "dateLivraison": cmd.date_livraison}

  def ajouter_facture(self, id_: int, facture: str) -> Commande:
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    cmd.facture = facture
    self.db.commit();
    self.db.refresh(cmd)
    return cmd

  def generer_rapport_livraison(self, id_: int) -> str:
    """
    Retourne un 'rapport' texte (remplace par PDF/Excel si besoin).
    """
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    self._recalc_totaux(cmd)
    lignes = self.produit_cmd_repo.find_by_commande_id(cmd.id)
    corps = "\n".join(
      f"{l.produit_id};{l.qtite_cmd};{l.qtite_recu};{l.pu_cmd};{l.pu_recept}"
      for l in lignes
    )
    return f"RAPPORT LIVRAISON CMD {cmd.ref}\n{corps}"

  def exporter_commande(self, id_: int) -> str:
    """
    Exporte la commande au format CSV (texte). Remplace par vrai fichier si besoin.
    """
    cmd = self.commande_repo.find_by_id(id_)
    if not cmd: raise HTTPException(status_code=404, detail="Commande non trouvée")
    lignes = self.produit_cmd_repo.find_by_commande_id(cmd.id)
    header = "produit_id;qtite_cmd;qtite_recu;unite_gratuite;pu_cmd;pu_recept;prix_public;date_peremption"
    rows = [
      f"{l.produit_id};{l.qtite_cmd};{l.qtite_recu};{l.unite_gratuite};{l.pu_cmd};{l.pu_recept};{l.prix_public};{l.date_peremption or ''}"
      for l in lignes
    ]
    return header + "\n" + "\n".join(rows)

  def ajouter_motif_annulation(self, id_: int, motif: str) -> Commande:

    cmd = self.commande_repo.find_by_id(id_)
    if not cmd or cmd.supprimer == 1:
      raise HTTPException(status_code=404, detail="Commande non trouvée")

    # Selon ton modèle : 'note' ou 'motif_annulation'
    # Ici on stocke dans 'note' si la colonne dédiée n’existe pas
    if hasattr(cmd, "motif_annulation"):
      cmd.motif_annulation = motif
    else:
      # concatène proprement si note déjà présente
      cmd.note = (cmd.note + " | " if cmd.note else "") + f"Motif annulation: {motif}"

    if (cmd.etat or "").upper() != "ANNULEE":
      cmd.etat = "ANNULEE"

    self.db.commit()
    self.db.refresh(cmd)
    return cmd

  def get_commande_info_by_product(
    self,
    page: int,
    size: int,
    produitId: Optional[str],
    startDate: Optional[str],
    endDate: Optional[str],
  ) -> CommandePageableCustomlDto:

    # Jointure ProduitCmd -> Commande
    q = (
      self.db.query(ProduitCmd, Commande)
      .join(Commande, ProduitCmd.commande_id == Commande.id)
      .filter(Commande.supprimer == 0)
    )

    if produitId:
      try:
        pid = int(produitId)
        q = q.filter(ProduitCmd.produit_id == pid)
      except ValueError:
        # Si produitId n'est pas un entier, on ignore le filtre (ou on lève une 422)
        pass

    if startDate:
      q = q.filter(Commande.date_creation >= startDate)
    if endDate:
      q = q.filter(Commande.date_creation <= endDate)

    q = q.order_by(Commande.date_creation.desc(), Commande.id.desc())

    # Pagination
    total = q.count()
    rows = q.offset(page * size).limit(size).all()

    # Mappe le résultat
    content: List[Dict[str, Any]] = []
    total_amount_cmd = 0.0
    total_amount_recu = 0.0
    total_qte_cmd = 0
    total_qte_recu = 0

    for pc, c in rows:
      item = {
        "commandeId": c.id,
        "ref": c.ref,
        "dateCreation": c.date_creation,
        "etat": c.etat,
        "fournisseur": c.fournisseur.nom if getattr(c, "fournisseur", None) else None,
        "produitId": pc.produit_id,
        "qtiteCmd": pc.qtite_cmd,
        "qtiteRecu": pc.qtite_recu,
        "puCmd": pc.pu_cmd,
        "puRecept": pc.pu_recept,
        "prixPublic": pc.prix_public,
        "datePeremption": pc.date_peremption,
        # Totaux au niveau commande (si présents sur l'entité)
        "montantCmd": c.montant_cmd,
        "montantRecu": c.montant_recu,
      }
      content.append(item)

      total_amount_cmd += float(c.montant_cmd or 0)
      total_amount_recu += float(c.montant_recu or 0)
      total_qte_cmd += int(pc.qtite_cmd or 0)
      total_qte_recu += int(pc.qtite_recu or 0)

    total_pages = (total + size - 1) // size if size else 1

    return CommandePageableCustomlDto(
      content=content,
      totalElements=total,
      totalPages=total_pages,
      pageSize=size,
      pageNumber=page,
      totalAmountRecu=total_amount_recu,
      totalAmountCommande=total_amount_cmd,
      totalQteRecu=total_qte_recu,
      totalQteCommande=total_qte_cmd,
    )

  def update_commande_simple(
    self,
    commandeId: Optional[str] = None,
    produitCmdId: Optional[str] = None,
    qteRecu: Optional[str] = None,
    prixAchat: Optional[str] = None,
    prixVente: Optional[str] = None,
  ) -> Commande:

    if not commandeId or not produitCmdId:
      raise HTTPException(status_code=422, detail="commandeId et produitCmdId sont requis")

    try:
      cid = int(commandeId)
      pcid = int(produitCmdId)
    except ValueError:
      raise HTTPException(status_code=422, detail="IDs invalides")

    cmd = self.commande_repo.find_by_id(cid)
    if not cmd or cmd.supprimer == 1:
      raise HTTPException(status_code=404, detail="Commande non trouvée")

    ligne = self.produit_cmd_repo.find_by_id(pcid)
    if not ligne or ligne.commande_id != cmd.id:
      raise HTTPException(status_code=404, detail="Ligne de commande non trouvée")

    # Applique les updates (si fournis)
    if qteRecu is not None:
      try:
        ligne.qtite_recu = int(qteRecu)
      except ValueError:
        raise HTTPException(status_code=422, detail="qteRecu invalide")

    if prixAchat is not None:
      try:
        pa = float(prixAchat)
        # selon ta logique: on peut mettre à jour pu_cmd (prix de commande) et/ou pu_recept (prix réception)
        ligne.pu_cmd = pa if ligne.pu_cmd is None else pa
        ligne.pu_recept = pa
      except ValueError:
        raise HTTPException(status_code=422, detail="prixAchat invalide")

    if prixVente is not None:
      try:
        ligne.prix_public = float(prixVente)
      except ValueError:
        raise HTTPException(status_code=422, detail="prixVente invalide")

    self.db.add(ligne)
    self.db.commit()

    # Recalcul des totaux commande
    self._recalc_totaux(cmd)
    return cmd

  def reapprovisionner_rupture(self, request: CommandeRuptureRequest, employe:Employe):
    quantite_totale = sum([p.quantiteRestante for p in request.produits])

    montant_total = sum([p.quantiteRestante * p.prixAchat for p in request.produits])

    commande = Commande(
      id= int(datetime.now().strftime("%Y%m%d%H%M%S")),
      employe_id=employe.id,
      fournisseur_id=request.fournisseurId,
      date_creation=datetime.utcnow(),
      ref=self.generer_reference_commande(self.commande_repo.count_mois()),
      qtite_cmd=quantite_totale,
      montant_cmd=montant_total,
      etat=request.type,
      supprimer=0
    )
    self.db.add(commande)

    for produit_request in request.produits:
      produit = self.produit_repo.find_by_id(produit_request.productId)
      fournisseur = self.fournisseur_repo.find_by_id(int(request.fournisseurId))
      if not produit:
        raise HTTPException(status_code=404, detail=f"Produit non trouvé {produit_request.id}")

      produit_cmd = ProduitCmd(
        commande_id=commande.id,
        produit_id=produit.id,
        pu_recept=produit_request.prixAchat or 0,
        qtite_cmd=produit_request.quantiteRestante,
        qtite_recu=produit_request.quantiteRestante or 0,
        pu_cmd=produit_request.prixAchat or 0,
        prix_public=produit_request.prix or 0,
        unite_gratuite=0
      )
      self.db.add(produit_cmd)

      formatted_now = datetime.now().strftime("%Y%m%d%H%M%S")
      if produit_request.produitEnRayontId is not None:
        produit_rayon = self.enrayon_repo.find_by_id(produit_request.produitEnRayontId)
        produit_rayon.quantite_restante = produit_rayon.quantite_restante +produit_request.quantiteRestante
      else :
        produit_rayon = EnRayon(
          id=f"{produit.id}{fournisseur.code}{formatted_now}",
          produit_id=produit.id,
          fournisseur_id=request.fournisseurId,
          commande_id=commande.id,
          date_livraison=datetime.fromisoformat(produit_request.dateLivraison),
          date_peremption=datetime.fromisoformat(produit_request.datePeremption),
          prix_achat=produit_request.prixAchat or 0,
          prix_vente=produit_request.prix or 0,
          reduction=produit_request.reduction,
          quantite=produit_request.quantiteRestante,
          quantite_restante=produit_request.quantiteRestante,
          supprimer=0,
        )

      self.db.add(produit_rayon)

      produit.stock = produit.stock + produit_request.quantiteRestante
      self.db.add(produit)

    self.db.commit()
    return commande
