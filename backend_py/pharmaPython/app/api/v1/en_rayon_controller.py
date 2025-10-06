from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime


from app.api.deps import get_db
from app.models.en_rayon import EnRayon, EnRayonIn
from app.models.rayon import Rayon
from app.schemas.enrayon_dto import ProduitEnRayonDto, ProduitDetailIncrementEnRayonDto, EnRayonDto, \
  EnRayonPageableCustomDto
from app.services.en_rayon_service import EnRayonService
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/en-rayon",
  tags=["EnRayon"],
  dependencies=[Depends(jwt_authentication)]  # équivalent @PreAuthorize
)

# ---------------------------
# Ajouter produits en rayon
# ---------------------------
@router.post("/ajouter", response_model=List[EnRayonIn])
def ajouter_produits(produits: List[ProduitEnRayonDto], db: Session = Depends(get_db)):
  service = EnRayonService(db)
  return service.ajouter_produits_en_rayon(produits)

# ---------------------------
# Mettre à jour produits en rayon
# ---------------------------
@router.put("/mettre-a-jour", response_model=List[EnRayonIn])
def mettre_a_jour_produits(produits: List[ProduitEnRayonDto], db: Session = Depends(get_db)):
  service = EnRayonService(db)
  return service.mettre_a_jour_produits_en_rayon(produits)

# ---------------------------
# Décrémenter stock
# ---------------------------
@router.post("/increment-produit-detail")
def decrementer_stock(data: ProduitDetailIncrementEnRayonDto, db: Session = Depends(get_db)):
  service = EnRayonService(db)
  return service.decrementer_stock(int(data.enRayonId), int(data.produitDetailId))

# ---------------------------
# Recherches par nom produit / produit / rayon / fournisseur
# ---------------------------
@router.get("/par-nom-produit", response_model=List[EnRayonIn])
def get_par_nom_produit(nomProduit: str, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_nom_produit(nomProduit)

@router.get("/par-produit")
def get_par_produit(produitId: int, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_produit(produitId)

@router.get("/par-produit-all")
def get_par_produit_all(produitId: int, produitType: str, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_produit(produitId)

@router.get("/par-nom-rayon", response_model=List[EnRayonIn])
def get_par_nom_rayon(nomRayon: str, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_nom_rayon(nomRayon)

@router.get("/par-fournisseur", response_model=List[EnRayonIn])
def get_par_fournisseur(nomFournisseur: str, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_fournisseur(nomFournisseur)

@router.get("/par-commande", response_model=List[EnRayonIn])
def get_par_commande(commandeId: int, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_commande(commandeId)

# ---------------------------
# Recherches par intervalle (dates & prix)
# ---------------------------
@router.get("/par-date-livraison", response_model=List[EnRayonIn])
def get_par_date_livraison(startDate: datetime, endDate: datetime, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_intervalle_livraison(startDate, endDate)

@router.get("/par-date-peremption", response_model=List[EnRayonIn])
def get_par_date_peremption(startDate: datetime, endDate: datetime, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_intervalle_peremption(startDate, endDate)

@router.get("/par-prix-achat", response_model=List[EnRayonIn])
def get_par_prix_achat(minPrix: float, maxPrix: float, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_intervalle_prix_achat(minPrix, maxPrix)

@router.get("/par-prix-vente", response_model=List[EnRayonIn])
def get_par_prix_vente(minPrix: float, maxPrix: float, db: Session = Depends(get_db)):
  return EnRayonService(db).get_produits_par_intervalle_prix_vente(minPrix, maxPrix)

# ---------------------------
# Mise à jour simple (save)
# ---------------------------
@router.post("/save", response_model=EnRayonIn)
def mettre_a_jour_produit(rayonDto: EnRayonDto, db: Session = Depends(get_db)):
  return EnRayonService(db).mettre_a_jour_produit(rayonDto)

# ---------------------------
# Pagination
# ---------------------------
@router.get("/pageable")
def get_pageable(
  nomProduit: Optional[str] = None,
  bientotPerimee: Optional[str] = None,
  joursAvantPeremption: Optional[str] = None,
  enStock: Optional[str] = None,
  page: int = 0,
  size: int = 10,
  sort: str = "id",
  direction: str = "desc",
  db: Session = Depends(get_db),
):
  service = EnRayonService(db)
  return service.get_produits_pageable(
    nomProduit, bientotPerimee, joursAvantPeremption, enStock,
    page, size, sort, direction
  )

@router.get("/pageable/new")
def get_pageable_new(
  nomProduit: Optional[str] = None,
  bientotPerimee: Optional[str] = None,
  joursAvantPeremption: Optional[str] = None,
  enStock: Optional[str] = None,
  startDate: Optional[str] = None,
  endDate: Optional[str] = None,
  page: str = "0",
  size: str = "10",
  sort: str = "id",
  direction: str = "desc",
  db: Session = Depends(get_db),
):
  return EnRayonService(db).get_produits_pageable_new(
    nomProduit, bientotPerimee, joursAvantPeremption,
    startDate, endDate, enStock, page, size, sort, direction
  )

@router.get("/product/pageable/new")
def get_pageable_produit_range(
  nomProduit: Optional[str] = None,
  bientotPerimee: Optional[str] = None,
  joursAvantPeremption: Optional[str] = None,
  enStock: Optional[str] = None,
  produitId: Optional[str] = None,
  supprimer: Optional[str] = None,
  startDate: Optional[str] = None,
  endDate: Optional[str] = None,
  page: str = "0",
  size: str = "10",
  sort: str = "id",
  direction: str = "desc",
  db: Session = Depends(get_db),
):
  return EnRayonService(db).get_produits_pageable_produit_range(
    nomProduit, produitId, supprimer,
    startDate, endDate,
    bientotPerimee, joursAvantPeremption, enStock,
    page, size, sort, direction
  )

# ---------------------------
# Suppression
# ---------------------------
@router.delete("/{id}", status_code=204)
def delete_enrayon(id: int, db: Session = Depends(get_db)):
  EnRayonService(db).delete_enrayon(id)
  return {"message": "deleted"}

# ---------------------------
# Ajout automatique produits manquants
# ---------------------------
@router.get("/ajouter_tous_produits_manquant_en_rayon")
def ajouter_tous_manquants(db: Session = Depends(get_db)):
  return EnRayonService(db).ajouter_tous_produits_manquants()

@router.get("/ajouter_produit_manquant_en_rayon")
def ajouter_un_manquant(produitId: str, db: Session = Depends(get_db)):
  return EnRayonService(db).ajouter_un_produit_manquant(int(produitId))

@router.get("/reset_rayon")
def reset_negative_stock_to_zero(db: Session = Depends(get_db),
                                 produit_ids: str | None = None,
                                 reset_all: bool = False,
                                 only_negative:bool=False):
  return EnRayonService(db).reset_negative_stock_to_zero(
    produit_ids=[int(x.strip()) for x in produit_ids.split(",") if x.strip().isdigit()],
    reset_all=reset_all,
    only_negative=only_negative,
  )
