from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.core.db import SessionLocal  # ta fabrique de sessions
from app.repositories.produit_repository import ProduitRepository
from app.services.ai.feature_store import get_daily_sales_series
from app.services.ai.forecast import forecast_daily
from app.services.ai.forecasting import OnlineDemandForecaster
from app.services.ai.service_ai.order_ai_service import suggest_reorders

forecaster = OnlineDemandForecaster()
scheduler = BackgroundScheduler(timezone="Africa/Douala")

def nightly_refresh():
  db: Session = SessionLocal()
  try:
    produits = ProduitRepository(db).find_top_n(500)
    for p in produits:
      series = get_daily_sales_series(db, p.id, 180)
      _ = forecast_daily(series, 14)  # <- ici tu peux mettre en cache Redis si tu veux
  finally:
    db.close()

# def start_scheduler():
#   scheduler.add_job(nightly_refresh, "cron", hour=2, minute=0)
#   scheduler.start()

def nightly_reorder_job():
  db: Session = SessionLocal()
  try:
    suggestions = suggest_reorders(db, forecaster)
    # TODO: créer des bons "Brouillon" + notifier (email/slack)
    print(f"[AI] {len(suggestions)} suggestions de réappro générées.")
  finally:
    db.close()

def start_scheduler():
  scheduler.add_job(nightly_reorder_job, "cron", hour=2, minute=0)
  scheduler.start()
