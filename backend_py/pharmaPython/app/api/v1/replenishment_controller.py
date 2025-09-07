# app/api/v1/replenishment_controller.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.ai.replenishment import compute_replenishment, generate_purchase_orders

router = APIRouter(prefix="/replenishment", tags=["replenishment"])

@router.get("/suggest/reco")
def suggest(db: Session = Depends(get_db)):
  recos = compute_replenishment(db)
  return [r.__dict__ for r in recos]

@router.post("/purchase-orders/preview/order")
def po_preview(db: Session = Depends(get_db)):
  return generate_purchase_orders(db)

# @router.post("/purchase-orders/commit")  # si tu veux vraiment créer les Commandes
# -> convertir le payload en entités Commande/LigneCommande, db.add(...), db.commit()
