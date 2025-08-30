# dashboard_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.api.deps import get_db
from app.schemas.dashboard_dto import OrderRow, TopProduct, StockAlertRow, SalesMonthlyPoint, CategorySales, KpiDto
from app.services.dashboard_service import DashboardService
from app.utility.jwt_authentication import jwt_authentication

# Si tu as une dépendance d'authentification JWT, dé-commente:
# from security.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/dashboard",
  tags=["Dashboard"],
  dependencies=[Depends(jwt_authentication)]  # équiv. @PreAuthorize("isAuthenticated()")
)


def _parse_dt(s: str | None, label: str) -> datetime:
  if not s:
    raise HTTPException(status_code=422, detail=f"Paramètre '{label}' requis")
  try:
    # Kotlin: LocalDateTime.parse(from.trim()) → ISO-8601
    return datetime.fromisoformat(s.strip())
  except Exception:
    raise HTTPException(status_code=422, detail=f"Format de date invalide pour '{label}' (ISO attendu)")


@router.get("/kpis", response_model=KpiDto)
def kpis(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_kpis(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/sales-monthly", response_model=List[SalesMonthlyPoint])
def sales_monthly(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_sales_monthly(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/sales-by-category", response_model=List[CategorySales])
def sales_by_category(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_sales_by_category(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/top-products", response_model=List[TopProduct])
def top_products(
  limit: int = Query(10, ge=1),
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_top_products(limit, _parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/orders-recent", response_model=List[OrderRow])
def orders_recent(
  page: int = Query(0, ge=0),
  size: int = Query(10, ge=1),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_orders_recent(page, size)


@router.get("/stock-alerts", response_model=List[StockAlertRow])
def stock_alerts(
  low: int = Query(10, ge=0),
  days: int = Query(30, ge=1),
  limit: int = Query(20, ge=1),
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_stock_alerts(low, days, limit)
