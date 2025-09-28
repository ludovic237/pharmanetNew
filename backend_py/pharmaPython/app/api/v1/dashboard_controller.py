# dashboard_controller.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.api.deps import get_db
from app.core.db import SessionLocal
from app.schemas.dashboard_dto import OrderRow, TopProduct, StockAlertRow, SalesMonthlyPoint, CategorySales, KpiDto
from app.services.ai.anomaly import score_caisse, train_caisse_anomaly_model
from app.services.ai.forecast import forecast_sales
from app.services.dashboard_service import DashboardService
from app.utility.jwt_authentication import jwt_authentication

# Si tu as une dépendance d'authentification JWT, dé-commente:
# from security.jwt_authentication import jwt_authentication

router = APIRouter(
  prefix="/dashboard",
  tags=["Dashboard"],
  # dependencies=[Depends(jwt_authentication)]  # équiv. @PreAuthorize("isAuthenticated()")
)

# modèle global (sera remplacé par un modèle entraîné au startup)
_ANOMALY_MODEL: IsolationForest | None = None


def _parse_dt(s: str | None, label: str) -> datetime:
  if not s:
    raise HTTPException(status_code=422, detail=f"Paramètre '{label}' requis")
  try:
    # Kotlin: LocalDateTime.parse(from.trim()) → ISO-8601
    return datetime.fromisoformat(s.strip())
  except Exception:
    raise HTTPException(status_code=422, detail=f"Format de date invalide pour '{label}' (ISO attendu)")


@router.get("/kpis", response_model=KpiDto)
def kpis_router(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  # Renvoie les indicateurs clés (CA total, moyennes, séries journalières…) entre deux dates pour le tableau de bord.
  """""
  Rôle : KPI globaux (CA, nb ventes, panier moyen, etc.).

Ce que ça fait : délègue à DashboardService.get_kpis(from, to) et renvoie un KpiDto. Ton frontend doit afficher les champs définis par KpiDto
  """""
  service = DashboardService(db)
  return service.get_kpis(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/sales-monthly", response_model=List[SalesMonthlyPoint])
def sales_monthly_router(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  """""
  Rôle : Séries mensuelles du chiffre d’affaires.
Ce que ça fait : délègue à DashboardService.get_sales_monthly(from, to) et renvoie une liste de SalesMonthlyPoint. Ton frontend doit afficher les champs définis par SalesMonthlyPoint

  Rôle : séries mensuelles des ventes pour graph (barres/aire).

Ce que ça fait : renvoie List[SalesMonthlyPoint] (typiquement {month/date, total}).
  """""
  service = DashboardService(db)
  return service.get_sales_monthly(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/sales-by-category", response_model=List[CategorySales])
def sales_by_category_router(
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  # Agrège le chiffre d’affaires par catégorie produit sur l’intervalle.
  """""
  Rôle : CA par catégorie (camembert).
Ce que ça fait : délègue à DashboardService.get_sales_by_category(from, to) et renvoie une liste de CategorySales. Ton frontend doit afficher les champs définis par CategorySales

  Rôle : répartition par catégorie pour un camembert/barres.

  Ce que ça fait : renvoie List[CategorySales] (typiquement {categorie, total}).
  """""
  service = DashboardService(db)
  return service.get_sales_by_category(_parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/top-products", response_model=List[TopProduct])
def top_products_router(
  limit: int = Query(10, ge=1),
  from_: str | None = Query(alias="from"),
  to: str | None = Query(alias="to"),
  db: Session = Depends(get_db),
):
  """""
  Rôle : Top N produits vendus.
  Ce que ça fait : délègue à DashboardService.get_top_products(limit, from, to) et renvoie une liste de TopProduct. Ton frontend doit afficher les champs définis par TopProduct

  Rôle : top N produits (quantités ou CA) pour un widget “Best sellers”.

  Ce que ça fait : renvoie List[TopProduct] (typiquement {produit_id, produit, qty/ca}).
  """""
  service = DashboardService(db)
  return service.get_top_products(limit, _parse_dt(from_, "from"), _parse_dt(to, "to"))


@router.get("/orders-recent", response_model=List[OrderRow])
def orders_recent_router(page: int = Query(0, ge=0), size: int = Query(10, ge=1), db: Session = Depends(get_db), ):
  """""
  Rôle : liste paginée des commandes récentes.
  Ce que ça fait : délègue à DashboardService.get_orders_recent(page, size) et renvoie une liste de OrderRow. Ton frontend doit afficher les champs définis par OrderRow

  Rôle : dernières commandes (liste paginée) pour un tableau.

  Ce que ça fait : renvoie List[OrderRow] (ex. {id, reference, client, date, total}).
  """""

  service = DashboardService(db)
  return service.get_orders_recent(page, size)


@router.get("/stock-alerts", response_model=List[StockAlertRow])
def stock_alerts_router(
  low: int = Query(10, ge=0),
  days: int = Query(30, ge=1),
  limit: int = Query(20, ge=1),
  db: Session = Depends(get_db),
):
  # Renvoie les articles proches de la rupture (calculés via la demande et le stock de sécurité).
  """""
  Rôle : alertes de stock (produits en rupture ou bientôt en rupture).
  Ce que ça fait : délègue à DashboardService.get_stock_alerts(low, days, limit) et renvoie une liste de StockAlertRow. Ton frontend doit afficher les champs définis par StockAlertRow

  Rôle : alertes stock synthétiques pour dashboard.

  Ce que ça fait : renvoie List[StockAlertRow].
  """""
  service = DashboardService(db)
  return service.get_stock_alerts(low, days, limit)


@router.get("/forecast_sales")
def forecast_sales_router(
  db: Session = Depends(get_db),
):
  """""
  Rôle : prévision des ventes pour les 14 prochains jours.
  Ce que ça fait : délègue à forecast_sales(db) et renvoie une série temporelle (pd.Series) avec les dates futures comme index et les prévisions comme valeurs. Ton frontend doit afficher les données de la série temporelle.

  Rôle : point d’entrée pour prévisions globales du dashboard (selon ton implémentation).

  Ce que ça fait : renvoie la structure retournée par forecast_sales(db) (ex. liste de couples {date, yhat} ou par catégorie).
  """""
  return forecast_sales(db)


# @router.on_event("startup")
def _train_anomaly_on_startup():
  global _ANOMALY_MODEL
  with SessionLocal() as db:
    _ANOMALY_MODEL = train_caisse_anomaly_model(db)


@router.get("/score-caisse/{caisse_id}")
def score_caisse_router(caisse_id: int, db: Session = Depends(get_db)):
  # Score d’anomalie d’une caisse (détection d’outliers sur montants/transactions).
  """""
  Rôle : score d’anomalie pour une caisse spécifique.
  Ce que ça fait : utilise le modèle global _ANOMALY_MODEL (le crée s’il n’existe pas encore) et délègue à score_caisse(db, model, caisse_id). Renvoie un dictionnaire avec caisseId et anomalyScore. Ton frontend doit afficher anomalyScore (0.0 = normal, <0 = anormal).

  Rôle : score d’anomalie sur une caisse (valeur continue, négative = plus anormal avec IsolationForest).

  Ce que ça fait : garantit un modèle entraîné et renvoie { caisseId, anomalyScore }
  """""

  global _ANOMALY_MODEL
  if _ANOMALY_MODEL is None:
    # sécurité si le startup n’a pas encore tourné
    _ANOMALY_MODEL = train_caisse_anomaly_model(db)
  score = score_caisse(db=db, model=_ANOMALY_MODEL, caisse_id=caisse_id)
  return {"caisseId": caisse_id, "anomalyScore": score}

@router.get("/stock-actual")
def stock_actual_router(
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_stock_actuel()

@router.get("/stock-perime")
def stock_perime_router(
  db: Session = Depends(get_db),
):
  service = DashboardService(db)
  return service.get_perime_actuel()
