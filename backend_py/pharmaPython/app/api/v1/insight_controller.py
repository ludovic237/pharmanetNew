# app/api/v1/insight_controller.py
from datetime import date, timedelta, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.ai.feature_store import get_daily_sales_series
from app.services.insight_service import kpis, sales_by_category, weekly_seasonality, basket_pairs, sales_monthly, \
  weekly_seasonality_between_two_date
from app.utility.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/insights",
  tags=["insights"],
  # dependencies=[Depends(jwt_authentication)],
)


def _parse_dt(s: str | None, label: str) -> datetime:
  if not s:
    raise HTTPException(status_code=422, detail=f"Paramètre '{label}' requis")
  try:
    # Kotlin: LocalDateTime.parse(from.trim()) → ISO-8601
    return datetime.fromisoformat(s.strip())
  except Exception:
    raise HTTPException(status_code=422, detail=f"Format de date invalide pour '{label}' (ISO attendu)")


@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), days: int = 30):
  return kpis(db, days)


@router.get("/sales-by-category")
def get_sales_by_category(db: Session = Depends(get_db),
                          start: datetime = datetime.now(),
                          end: datetime = datetime.now().replace(day=1)):
  return sales_by_category(db, from_dt=start, to_dt=end)


@router.get("/weekly-seasonality")
def get_weekly_seasonality(db: Session = Depends(get_db), weeks: int = 30):
  return weekly_seasonality(db, weeks)


@router.get("/weekly-seasonality/range")
def get_weekly_seasonality_range(db: Session = Depends(get_db), start: datetime = datetime.now(),
                                 end: datetime = datetime.now().replace(day=1)):
  return weekly_seasonality_between_two_date(db, start, end)


@router.get("/sales_monthly")
def get_sales_monthly(db: Session = Depends(get_db), since: date = (date.today() - timedelta(days=260)),
                      until: date = date.today()):
  return sales_monthly(db, since, until)


@router.get("/daily_sales")
def daily_sales(produit_id: int,
                end: datetime = datetime.now(),
                start: datetime = datetime.now().replace(day=1),
                horizon_days: int = 14, history_days: int = 180, db: Session = Depends(get_db)):
  series = get_daily_sales_series(db, produit_id, days=history_days, end=end, start=start)
  return series


@router.get("/basket-pairs")
def get_basket_pairs(db: Session = Depends(get_db), days: int = 30, min_support: int = 10):
  return basket_pairs(db, days, min_support)
