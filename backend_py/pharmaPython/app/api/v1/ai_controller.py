from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
# Repos que tu as déjà :
from app.repositories.produit_repository import ProduitRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.schemas.ai.ai_schemas import ForecastResponse, ForecastPoint, ReplenishmentSuggestion, StockAlert, \
  RecommendationsResponse, Recommendation, AnomalyResponse, AnomalyPoint, OptimizeDashboardResponse
from app.services.ai.alerts import build_stock_alerts
from app.services.ai.anomaly import zscore_anomalies
from app.services.ai.feature_store import get_daily_sales_series, get_current_stock, get_products_basic
from app.services.ai.forecast import forecast_daily
from app.services.ai.reco import also_bought_from_baskets
from app.services.ai.replenishment import compute_safety_stock, compute_reorder_point, suggested_order_qty

router = APIRouter(prefix="/ai", tags=["AI"])


# jkdsjds
# prévoit les ventes journalières futures d’un produit
@router.get("/forecast/{produit_id}", response_model=ForecastResponse)
def forecast_produit(produit_id: int, horizon_days: int = 14, history_days: int = 180, db: Session = Depends(get_db)):
  """
  Rôle : prévoit les ventes journalières futures d’un produit.

  Ce que ça fait : charge l’historique avec get_daily_sales_series, calcule une prévision via forecast_daily, emballe dans un ForecastResponse.

  ai_controller

  Réponse (exemple) :

  {
    "produit_id": 123,
    "horizon_days": 14,
    "history_days": 180,
    "forecast": [
      {"date": "2025-08-20", "yhat": 3.4},
      {"date": "2025-08-21", "yhat": 3.5}
    ]
  }

  """
  """
  Generate a sales forecast for a specific product.

  Args:
      produit_id (int): The ID of the product to forecast.
      horizon_days (int): The number of days to forecast into the future. Default is 14.
      history_days (int): The number of historical days to consider. Default is 180.
      db (Session): The database session dependency.

  Returns:
      ForecastResponse: The forecasted sales data for the product.
  """
  series = get_daily_sales_series(db, produit_id, days=history_days)
  fc = forecast_daily(series, horizon_days=horizon_days)
  return ForecastResponse(
    produit_id=produit_id,
    horizon_days=horizon_days,
    history_days=history_days,
    forecast=[ForecastPoint(date=d, yhat=y) for d, y in fc]
  )


@router.get("/replenishment/{produit_id}", response_model=ReplenishmentSuggestion)
def suggest_replenishment(
  produit_id: int,
  lead_time_days: int = 7,
  target_coverage_days: int = 21,
  history_days: int = 180,
  db: Session = Depends(get_db)
):
  """""
  - Rôle : calcule le stock de sécurité, le point de commande (ROP), et la quantité suggérée à commander.

  - Ce que ça fait : moyenne journalière, safety stock (compute_safety_stock), ROP (compute_reorder_point), stock courant (get_current_stock), somme des prévisions pour estimer la demande prochaine, quantité suggérée.

  Réponse (exemple) :

{
  "produit_id": 123,
  "current_stock": 18,
  "safety_stock": 7.2,
  "reorder_point": 19.6,
  "suggested_order_qty": 6,
  "rationale": "Avg=1.12/d, LT=7j, Target=21j"
}

  """""
  """
    Suggest replenishment quantities for a product based on sales data.

    Args:
        produit_id (int): The ID of the product.
        lead_time_days (int): The lead time in days for replenishment. Default is 7.
        target_coverage_days (int): The target coverage period in days. Default is 21.
        history_days (int): The number of historical days to consider. Default is 180.
        db (Session): The database session dependency.

    Returns:
        ReplenishmentSuggestion: The suggested replenishment quantities and rationale.
    """
  series = get_daily_sales_series(db, produit_id, days=history_days)
  avg_daily = (sum(v for _, v in series) / max(len(series), 1)) if series else 0.0
  ss = compute_safety_stock(series, lead_time_days=lead_time_days, service_level_z=1.65)
  rop = compute_reorder_point(avg_daily, lead_time_days, ss)
  stock = get_current_stock(db, produit_id)
  # somme des prévisions dans la fenêtre = proxy
  fc = forecast_daily(series, horizon_days=target_coverage_days)
  demand_next = sum(y for _, y in fc)
  qty = suggested_order_qty(stock, demand_next, rop, target_coverage_days, avg_daily)
  return ReplenishmentSuggestion(
    produit_id=produit_id,
    current_stock=stock,
    safety_stock=round(ss, 2),
    reorder_point=round(rop, 2),
    suggested_order_qty=qty,
    rationale=f"Avg={avg_daily:.2f}/d, LT={lead_time_days}j, Target={target_coverage_days}j"
  )


@router.get("/alerts/low-stock", response_model=List[StockAlert])
def low_stock_alerts(threshold: float = 5.0, limit: int = 100, db: Session = Depends(get_db)):
  # Exemple: récupère les stocks et produits
  """
  - Rôle : liste de produits en stock bas pour afficher des alertes.

  - Ce que ça fait : prend les N meilleurs produits, récupère leur stock, applique la logique d’alerte.

  Réponse (exemple) :

[
  {"produit_id": 12, "produit": "Paracétamol 500mg", "stock": 3, "threshold": 5},
  {"produit_id": 98, "produit": "Ibuprofène 400mg", "stock": 2, "threshold": 5}
]

  """
  """
    Generate low stock alerts for products below a specified threshold.

    Args:
        threshold (float): The stock threshold to trigger alerts. Default is 5.0.
        limit (int): The maximum number of products to check. Default is 100.
        db (Session): The database session dependency.

    Returns:
        List[StockAlert]: A list of low stock alerts.
    """
  produits = ProduitRepository(db).find_top_n(limit)  # id, nom
  rows = []
  for p in produits:
    stock = get_current_stock(db, p.id)
    rows.append({"produit_id": p.id, "produit": p.nom, "stock": stock, "threshold": threshold})
  return [StockAlert(**a) for a in build_stock_alerts(rows, low_threshold=threshold)]


@router.get("/recommendations", response_model=RecommendationsResponse)
def recommendations(for_produit_id: Optional[int] = None, limit_baskets: int = 5000, db: Session = Depends(get_db)):
  # Récupère les paniers (listes d’IDs produit par vente)

  """
  - Rôle : produits achetés ensemble (cross-sell) pour reco en panier / fiche produit.

  - Ce que ça fait : reconstruit des paniers récents, calcule les co-achats, enrichit avec les noms produits, renvoie des scores

  Réponse (exemple) :

{
  "for_produit_id": 123,
  "recommendations": [
    {"produit_id": 45, "produit": "Vitamine C 1000", "score": 0.72},
    {"produit_id": 67, "produit": "Zinc 15mg", "score": 0.51}
  ]
}
  """
  """
    Generate product recommendations based on basket data.

    Args:
        for_produit_id (Optional[int]): The product ID to generate recommendations for. Default is None.
        limit_baskets (int): The maximum number of baskets to analyze. Default is 5000.
        db (Session): The database session dependency.

    Returns:
        RecommendationsResponse: A list of product recommendations.
    """
  baskets = ConcernerRepository(db).fetch_last_baskets(limit=limit_baskets)
  # -> [[prod_id, prod_id, ...], ...]
  recos = also_bought_from_baskets(baskets, top_k=8, for_product=for_produit_id)
  # Optionnel: enrichir le nom produit
  id2nom = {p["id"]: p["nom"] for p in get_products_basic(db, limit=10000)}
  enriched = [Recommendation(produit_id=r["produit_id"], produit=id2nom.get(r["produit_id"]), score=r["score"]) for r in
              recos]
  return RecommendationsResponse(for_produit_id=for_produit_id, recommendations=enriched)


@router.get("/anomalies/sales", response_model=AnomalyResponse)
def anomalies_sales(produit_id: int, days: int = 180, z: float = 2.5, db: Session = Depends(get_db)):
  """
  - Rôle : détecte les jours anormaux (pics/chutes) sur les ventes quotidiennes.

  - Ce que ça fait : calcule z-score sur la série et renvoie les points anormaux.

  Réponse (exemple) :

{
  "metric": "daily_sales_123",
  "anomalies": [
    {"date": "2025-07-02", "value": 48.0, "zscore": 3.6},
    {"date": "2025-07-18", "value": 0.0, "zscore": -2.8}
  ]
}

  """
  """
    Detect anomalies in sales data for a specific product.

    Args:
        produit_id (int): The product ID to analyze.
        days (int): The number of historical days to consider. Default is 180.
        z (float): The Z-score threshold for anomaly detection. Default is 2.5.
        db (Session): The database session dependency.

    Returns:
        AnomalyResponse: A list of detected anomalies.
    """
  series = get_daily_sales_series(db, produit_id, days=days)
  out = zscore_anomalies(series, z=z)
  return AnomalyResponse(
    metric=f"daily_sales_{produit_id}",
    anomalies=[AnomalyPoint(date=d, value=v, zscore=zs) for d, v, zs in out]
  )


@router.get("/optimize/dashboard", response_model=OptimizeDashboardResponse)
def optimize_dashboard(db: Session = Depends(get_db)):
  # Best sellers (simples): via fréquence dans les paniers

  """
  Rôle : payload tout-en-un pour le tableau de bord IA (best-sellers, alertes stock, réassorts suggérés).

Ce que ça fait : calcule 3 blocs : best_sellers, low_stock, reorder_suggestions.

Réponse (exemple) :

{
  "best_sellers": [{"produit_id": 45, "produit": "Vitamine C 1000", "score": 0.88}],
  "low_stock": [{"produit_id": 12, "produit": "Paracétamol 500mg", "stock": 3, "threshold": 5}],
  "reorder_suggestions": [
    {"produit_id": 98, "current_stock": 4, "safety_stock": 6.1, "reorder_point": 14.5, "suggested_order_qty": 11, "rationale": "Nom: avg=0.9/d"}
  ]
}
  """
  """
    Optimize the dashboard by providing best sellers, low stock alerts, and reorder suggestions.

    Args:
        db (Session): The database session dependency.

    Returns:
        OptimizeDashboardResponse: The optimized dashboard data.
    """

  baskets = ConcernerRepository(db).fetch_last_baskets(limit=10000)

  recos = also_bought_from_baskets(baskets, top_k=10, for_product=None)

  id2nom = {p["id"]: p["nom"] for p in get_products_basic(db, limit=10000)}

  best = [Recommendation(produit_id=r["produit_id"], produit=id2nom.get(r["produit_id"]), score=r["score"]) for r in
          recos]

  # Low stock
  produits = ProduitRepository(db).find_top_n(limit=100)
  rows = [{"produit_id": p.id, "produit": p.nom, "stock": get_current_stock(db, p.id), "threshold": 5.0} for p in
          produits]
  alerts = [StockAlert(**a) for a in build_stock_alerts(rows, low_threshold=5.0)]

  # Reorder suggestions top N (rapide)
  suggestions = []
  for p in produits[:20]:
    series = get_daily_sales_series(db, p.id, days=120)
    avg_daily = (sum(v for _, v in series) / max(len(series), 1)) if series else 0.0
    ss = compute_safety_stock(series, lead_time_days=7)
    rop = compute_reorder_point(avg_daily, 7, ss)
    stock = get_current_stock(db, p.id)
    qty = suggested_order_qty(stock, sum(y for _, y in forecast_daily(series, 21)), rop, 21, avg_daily)
    if qty > 0:
      suggestions.append(
        ReplenishmentSuggestion(
          produit_id=p.id, current_stock=stock, safety_stock=round(ss, 2),
          reorder_point=round(rop, 2), suggested_order_qty=qty,
          rationale=f"{p.nom}: avg={avg_daily:.2f}/d"
        )
      )
  return OptimizeDashboardResponse(best_sellers=best, low_stock=alerts, reorder_suggestions=suggestions)
