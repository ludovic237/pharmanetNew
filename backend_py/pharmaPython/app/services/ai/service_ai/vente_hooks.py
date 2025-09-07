# app/services/vente_hooks.py
from datetime import date

from app.services.ai.forecasting import OnlineDemandForecaster

# singleton ou injection
forecaster = OnlineDemandForecaster()

def on_vente_committed(produit_id: int, qte: float, vente_date: date):
  forecaster.update(produit_id, vente_date, qte)
