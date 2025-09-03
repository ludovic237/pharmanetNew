# app/api/v1/stock_alert_controller.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_db
from app.schemas.stock_alert import StockAlertSchema
from app.services.stock_alert_service import compute_and_store_alerts, acknowledge, close
from app.models.stock_alert import StockAlert

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[StockAlertSchema])
def list_alerts(db: Session = Depends(get_db)):
  return db.query(StockAlert).filter(StockAlert.status=="OPEN").order_by(StockAlert.created_at.desc()).all()

@router.post("/compute")
def compute(db: Session = Depends(get_db)):
  return {"created": compute_and_store_alerts(db)}

@router.post("/{alert_id}/ack")
def ack(alert_id: int, db: Session = Depends(get_db)):
  acknowledge(db, alert_id); return {"status": "OK"}

@router.post("/{alert_id}/close")
def close_alert(alert_id: int, db: Session = Depends(get_db)):
  close(db, alert_id); return {"status": "OK"}
