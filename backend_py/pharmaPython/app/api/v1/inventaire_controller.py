from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.api.deps import get_db
from app.models.employe import Employe
from app.models.inventaire import InventaireSchema
from app.models.produit_inventaire import ProduitInventaireSchema
from app.schemas.inventaire_dto import InventaireRequestDto, InventaireNewCreatetDto, \
  InventaireOneProductUpdateRequestDto, InventaireUpdateRequestDto
from app.services.inventaire_service import InventaireService
from app.utility.jwt_authentication import jwt_authentication
from app.utility.user_utils import UserUtils

router = APIRouter(
  prefix="/admin/inventaire",
  tags=["Inventaire"],
  dependencies=[Depends(jwt_authentication)],
)


@router.post("/create", response_model=InventaireSchema)
def creer_inventaire(data: InventaireRequestDto, db: Session = Depends(get_db)):
  return InventaireService(db).creer_inventaire(data)


@router.post("/create-new")
def creer_inventaire_new(data: InventaireNewCreatetDto, db: Session = Depends(get_db),
                         employe: Employe = Depends(UserUtils.get_current_employe)):
  return InventaireService(db).creer_inventaire_new(data, employe)


@router.get("/close/{id}")
def cloturer_inventaire(id: int, db: Session = Depends(get_db)):
  return InventaireService(db).cloturer_inventaire(id)


@router.put("/update/{id}", response_model=InventaireSchema)
def mettre_a_jour_inventaire(data: InventaireUpdateRequestDto, db: Session = Depends(get_db),
                             employe: Employe = Depends(UserUtils.get_current_employe)):
  return InventaireService(db).mettre_a_jour_inventaire(data, employe)


@router.put("/update/valid/product/{id}", response_model=ProduitInventaireSchema)
def add_product_to_inventory(data: InventaireOneProductUpdateRequestDto, db: Session = Depends(get_db),
                             employe: Employe = Depends(UserUtils.get_current_employe)):
  return InventaireService(db).valide_product_to_inventory(data, employe)


@router.delete("/update/invalid/product/{id}", response_model=Dict[str, Any])
def invalide_product_to_inventory(id: str, db: Session = Depends(get_db)):
  return InventaireService(db).invalide_product_to_inventory(id)


@router.get("/list")
def lister_inventaires(
  page: int = Query(0), size: int = Query(10),
  sort: str = Query("id"), direction: str = Query("desc"),
  db: Session = Depends(get_db),
):
  return InventaireService(db).lister_inventaires_custom(page, size, sort, direction)


@router.get("/list/new")
def lister_inventaires_custom(
  page: int = Query(0), size: int = Query(10),
  sort: str = Query("id"), direction: str = Query("desc"),
  db: Session = Depends(get_db),
):
  return InventaireService(db).lister_inventaires_custom(page, size, sort, direction)


@router.get("/{id}/products")
def lister_produits_par_inventaire(
  id: int, page: int = 0, size: int = 10, sort: str = "id", direction: str = "desc",
  db: Session = Depends(get_db),
):
  return InventaireService(db).lister_produits_par_inventaire(id, page, size, sort, direction)


@router.get("/pageable/{id}/products")
def lister_produits_par_inventaire_as_map(
  id: str, search: Optional[str] = None,
  page: int = 0, size: int = 10, sort: str = "id", direction: str = "desc",
  db: Session = Depends(get_db),
):
  return InventaireService(db).lister_produits_par_inventaire_as_map(search, id, page, size, sort, direction)


@router.get("/pageable/{id}/filter/products")
def lister_produits_par_inventaire_avec_filtre(
  id: str, filtre: str = "equal",
  page: int = 0, size: int = 10, sort: str = "id", direction: str = "desc",
  db: Session = Depends(get_db),
):
  return InventaireService(db).lister_produits_par_inventaire_avec_filtre(id, page, size, sort, direction, filtre)


@router.get("/info/produit_inventaire/{id}")
def get_info_produits_inventaire(id: str, db: Session = Depends(get_db)):
  return InventaireService(db).get_info_produits_inventaire(id)


@router.get("/terminer/{id}", response_model=InventaireSchema)
def terminer_inventaire(id: int, commentaire: str, db: Session = Depends(get_db)):
  return InventaireService(db).terminer_inventaire(id, commentaire)
