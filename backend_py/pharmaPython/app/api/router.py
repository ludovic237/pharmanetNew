from fastapi import APIRouter

from app.api.v1 import app_setting_controller
from app.api.v1 import auth_controller
from app.api.v1 import bon_caisse_controller
from app.api.v1 import caisse_controller
from app.api.v1 import categorie_controller
from app.api.v1 import commande_controller
from app.api.v1 import dashboard_controller
from app.api.v1 import depense_controller
from app.api.v1 import employe_controller
from app.api.v1 import en_rayon_controller
from app.api.v1 import fabriquant_controller
from app.api.v1 import forme_controller
from app.api.v1 import fournisseur_controller
from app.api.v1 import inventaire_controller
from app.api.v1 import magasin_controller
from app.api.v1 import prescripteur_controller
from app.api.v1 import product_controller
from app.api.v1 import produit_controller
from app.api.v1 import produit_detail_controller
from app.api.v1 import rayon_controller
from app.api.v1 import retour_produit_controller
from app.api.v1 import sortie_controller
from app.api.v1 import ticket_caisse_controller
from app.api.v1 import type_sortie_controller
from app.api.v1 import user_controller
from app.api.v1 import vente_controller

api_router = APIRouter(prefix="/api")

api_router.include_router(app_setting_controller.router)
api_router.include_router(auth_controller.router)
api_router.include_router(bon_caisse_controller.router)
api_router.include_router(caisse_controller.router)
api_router.include_router(categorie_controller.router)
api_router.include_router(commande_controller.router)
api_router.include_router(dashboard_controller.router)
api_router.include_router(depense_controller.router)
api_router.include_router(employe_controller.router)
api_router.include_router(en_rayon_controller.router)
api_router.include_router(fabriquant_controller.router)
api_router.include_router(forme_controller.router)
api_router.include_router(fournisseur_controller.router)
api_router.include_router(inventaire_controller.router)
api_router.include_router(magasin_controller.router)
api_router.include_router(prescripteur_controller.router)
api_router.include_router(product_controller.router)
api_router.include_router(produit_controller.router)
api_router.include_router(produit_detail_controller.router)
api_router.include_router(rayon_controller.router)
api_router.include_router(retour_produit_controller.router)
api_router.include_router(sortie_controller.router)
api_router.include_router(ticket_caisse_controller.router)
api_router.include_router(type_sortie_controller.router)
api_router.include_router(user_controller.router)
api_router.include_router(vente_controller.router)
