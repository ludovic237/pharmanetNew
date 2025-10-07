from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.api.deps import get_db

from app.models.commandeout import CommandeSchema
from app.models.employe import Employe
from app.schemas.commande_dto import ProduitCmdRequest, CommandeNewDTO, CommandePageableCustomlDto, CommandeRequest, \
  CommandeRuptureRequest
from app.services.commande_service import CommandeService
from app.utility.jwt_authentication import jwt_authentication
from app.utility.user_utils import UserUtils

router = APIRouter(
  prefix="/commandes",
  tags=["Commandes"],
  dependencies=[Depends(jwt_authentication)],
)


# ----------------------------
# Créer une commande
# ----------------------------
@router.post("/", response_model=CommandeSchema)
def creer_commande(commande_dto: CommandeRequest, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.create_commande(commande_dto)


# ----------------------------
# Réceptionner une commande
# ----------------------------
@router.post("/{id}/reception", response_model=CommandeSchema)
def receptionner_commande(
  id: int,
  receptionType: str,
  produits: List[ProduitCmdRequest],
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.receptionner_commande(id, receptionType, produits)


# ----------------------------
# Liste des commandes (mappées)
# ----------------------------
@router.get("/", response_model=List[Dict[str, Any]])
def get_all_commandes_mapped(db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.get_all_commandes_mapped()


# ----------------------------
# Liste des commandes paginées
# ----------------------------
@router.get("/paged")
def get_all_commandes_paged(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  etat: Optional[str] = None,
  typeFournisseur: Optional[str] = None,
  fournisseurId: Optional[str] = None,
  startDate: Optional[str] = None,
  endDate: Optional[str] = None,
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.get_all_commandes_mapped_pageable(page, size, etat, fournisseurId, typeFournisseur, startDate, endDate)


# ----------------------------
# Obtenir une commande par ID
# ----------------------------
@router.get("/{id}", response_model=Dict[str, Any])
def obtenir_commande(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.get_commande_by_id(id)


# ----------------------------
# Modifier lignes d'une commande
# ----------------------------
@router.post("/{id}/modifier-lignes", response_model=CommandeSchema)
def modifier_lignes(id: int, produits: List[ProduitCmdRequest], db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.modifier_lignes_commande(id, produits)


# ----------------------------
# Créer une commande fournisseur
# ----------------------------
@router.post("/commande_par_fournisseur")
def commande_by_fournisseur(
  fournisseurId: Optional[str],
  totalAmount: str,
  produits: List[CommandeNewDTO],
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.commande_by_fournisseur(fournisseurId, totalAmount, produits)


@router.post("/commande_par_fournisseur/rupture")
def commande_by_fournisseur(
  fournisseurId: Optional[str],
  totalAmount: str,
  produits: List[CommandeNewDTO],
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.commande_by_fournisseur(fournisseurId, totalAmount, produits)


# ----------------------------
# Supprimer une commande
# ----------------------------
@router.delete("/{id}", status_code=204)
def supprimer_commande(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  service.supprimer_commande(id)
  return {"message": "Commande supprimée"}


# ----------------------------
# Ajouter fournisseur à une commande
# ----------------------------
@router.post("/{id}/ajouter-fournisseur", response_model=CommandeSchema)
def ajouter_fournisseur(id: int, fournisseurId: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.ajouter_fournisseur(id, fournisseurId)


# ----------------------------
# Annuler une commande
# ----------------------------
@router.post("/{id}/annuler", response_model=CommandeSchema)
def annuler_commande(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.annuler_commande(id)


# ----------------------------
# Imprimer bon PDF
# ----------------------------
@router.post("/{id}/imprimer-bon-pdf")
def imprimer_bon_pdf(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  pdf_bytes = service.imprimer_bon_pdf(id)
  return {
    "filename": "bon_commande.pdf",
    "content": pdf_bytes
  }


# ----------------------------
# Réception complémentaire
# ----------------------------
@router.post("/{id}/reception-complementaire", response_model=CommandeSchema)
def reception_complementaire(id: int, produits: List[ProduitCmdRequest], db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.reception_complementaire(id, produits)


# ----------------------------
# Ajouter justificatif
# ----------------------------
@router.post("/{id}/ajouter-justificatif", response_model=CommandeSchema)
def ajouter_justificatif(id: int, justificatif: str, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.ajouter_justificatif(id, justificatif)


# ----------------------------
# Historique de réception
# ----------------------------
@router.get("/{id}/historique-reception", response_model=List[Dict[str, Any]])
def visualiser_historique(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.visualiser_historique_reception(id)


# ----------------------------
# Clôturer commande
# ----------------------------
@router.post("/{id}/cloturer", response_model=Dict[str, Any])
def cloturer_commande(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.cloturer_commande(id)


# ----------------------------
# Ajouter facture
# ----------------------------
@router.post("/{id}/ajouter-facture", response_model=CommandeSchema)
def ajouter_facture(id: int, facture: str, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.ajouter_facture(id, facture)


# ----------------------------
# Générer rapport livraison
# ----------------------------
@router.post("/{id}/generer-rapport", response_model=str)
def generer_rapport(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.generer_rapport_livraison(id)


# ----------------------------
# Exporter commande
# ----------------------------
@router.get("/{id}/exporter", response_model=str)
def exporter_commande(id: int, db: Session = Depends(get_db)):
  service = CommandeService(db)
  return service.exporter_commande(id)


# ----------------------------
# Ajouter motif d’annulation
# ----------------------------
@router.post("/{id}/ajouter-motif-annulation", status_code=204)
def ajouter_motif_annulation(id: int, motif: str, db: Session = Depends(get_db)):
  service = CommandeService(db)
  service.annuler_commande(id)
  service.ajouter_motif_annulation(id, motif)
  return {"message": "Motif ajouté"}


# ----------------------------
# Commande info par produit (paged)
# ----------------------------
@router.get("/product/paged", response_model=CommandePageableCustomlDto)
def get_commande_info_by_product(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  produitId: Optional[str] = None,
  startDate: Optional[str] = None,
  endDate: Optional[str] = None,
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.get_commande_info_by_product(page, size, produitId, startDate, endDate)


# ----------------------------
# Update commande simple (produit)
# ----------------------------
@router.post("/product-commande/update", response_model=CommandeSchema)
def update_commande_simple(
  commandeId: Optional[str] = None,
  produitCmdId: Optional[str] = None,
  qteRecu: Optional[str] = None,
  prixAchat: Optional[str] = None,
  prixVente: Optional[str] = None,
  db: Session = Depends(get_db)
):
  service = CommandeService(db)
  return service.update_commande_simple(commandeId, produitCmdId, qteRecu, prixAchat, prixVente)

@router.post("/product-commande/rupture")
def commande_rupture(commande_dto: CommandeRuptureRequest, db: Session = Depends(get_db), employe: Employe = Depends(UserUtils.get_current_employe)):
  service = CommandeService(db)
  return service.reapprovisionner_rupture(commande_dto,employe)
