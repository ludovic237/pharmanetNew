from datetime import datetime
from statistics import mean

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
from app.services.ai.replenishment import compute_safety_stock, compute_reorder_point, suggested_order_qty, \
  compute_replenishment, compute_replenishment_new

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
def suggest_replenishment(produit_id: int, lead_time_days: int = 7, target_coverage_days: int = 21,
                          history_days: int = 180, db: Session = Depends(get_db)
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
  produit = ProduitRepository(db).find_by_id(produit_id)
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
    rationale=f"Avg={avg_daily:.2f}/d, LT={lead_time_days}j, Target={target_coverage_days}j",
    nom=produit.nom,
    avg_daily=f"{avg_daily:.2f}"
  )


# @router.get("/alerts/low-stock", response_model=List[StockAlert])
@router.get("/alerts/low-stock")
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
    rows.append({"produit_id": p.id, "max": p.stock_max, "min": p.stock_min, "produit": p.nom, "stock": stock,
                 "threshold": threshold})
  # return [StockAlert(**a) for a in build_stock_alerts(rows, low_threshold=threshold)]
  return [a for a in build_stock_alerts(rows, low_threshold=threshold)]


@router.get("/recommendations", response_model=RecommendationsResponse)
def recommendations(for_produit_id: Optional[int] = None, top_k: int = 8, limit_baskets: int = 5000,
                    db: Session = Depends(get_db)):
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
  recos = also_bought_from_baskets(baskets, top_k=top_k, for_product=for_produit_id)
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

  """
  Optimize dashboard :
  - les meilleurs produits vendu par rapport au derniere vente
  - la quantite en stock
   """


# @router.get("/optimize/dashboard")
# def optimize_dashboard(last_sell: int = 100, last_day_sell: int = 360, top_product_number_in_basket: int = 10,
#                        total_product_number: Optional[int] = 0,
#                        total_qty_concerner_by_product: Optional[int] = 100,
#                        min_stock: Optional[int] = 5.0,
#                        temp_dattente_pour_futur_approvisionnemen: Optional[int] = 7,
#                        db: Session = Depends(get_db)):
#   if total_product_number == 0:
#     total_product_number = len(ProduitRepository(db).find_all())
#   if total_qty_concerner_by_product == 0:
#     total_qty_concerner_by_product = len(ProduitRepository(db).find_all())
#   # best sell
#   baskets = ConcernerRepository(db).fetch_last_baskets(limit=last_sell)
#   recos = also_bought_from_baskets(baskets, top_k=top_product_number_in_basket, for_product=None)
#   id2nom = {p["id"]: p["nom"] for p in get_products_basic(db, limit=total_product_number)}
#   best = [Recommendation(produit_id=r["produit_id"], produit=id2nom.get(r["produit_id"]), score=r["score"]) for r in
#           recos]
#   # Low stock
#   produits = ProduitRepository(db).find_top_n(limit=total_qty_concerner_by_product)
#   rows = [
#     {"produit_id": p.id, "max": p.stock_max, "min": p.stock_min, "produit": p.nom, "stock": get_current_stock(db, p.id),
#      "threshold": 5.0} for p in
#     produits]
#   alerts = [StockAlert(**a) for a in build_stock_alerts(rows, low_threshold=min_stock)]
#   # Reorder suggestions top N (rapide)
#   suggestions = []
#   for p in produits:
#     series = get_daily_sales_series(db, p.id, days=last_day_sell)
#     avg_daily = (sum(v for _, v in series) / max(len(series), 1)) if series else 0.0
#     ss = compute_safety_stock(series, lead_time_days=temp_dattente_pour_futur_approvisionnemen)
#     rop = compute_reorder_point(avg_daily, 7, ss)
#     stock = get_current_stock(db, p.id)
#
#     qty = suggested_order_qty(
#       stock,
#       sum(y for _, y in forecast_daily(series, 21)),
#       rop,
#       21,
#       avg_daily)
#     if qty > 0:
#       suggestions.append(
#         ReplenishmentSuggestion(
#           produit_id=p.id, current_stock=stock, safety_stock=round(ss, 2),
#           reorder_point=round(rop, 2), suggested_order_qty=qty,
#           rationale=f"{p.nom}: avg={avg_daily:.2f}/d",
#           nom=p.nom,
#           avg_daily=f"{avg_daily:.2f}"
#         )
#       )
#   return OptimizeDashboardResponse(best_sellers=best, low_stock=alerts, reorder_suggestions=suggestions)


@router.get("/optimize/best-sell")
def bestSell(last_sell: int = 100, top_product_number_in_basket: int = 10,
             total_product_number: Optional[int] = 0,
             page: int = 0,
             size: int = 10,
             db: Session = Depends(get_db)):
  if total_product_number == 0:
    total_product_number = ProduitRepository(db).get_total_count()
  # best sell
  baskets = ConcernerRepository(db).fetch_last_baskets(limit=last_sell)
  recos = also_bought_from_baskets(baskets, top_k=top_product_number_in_basket, for_product=None)
  id2nom = {p["id"]: p["nom"] for p in get_products_basic(db, limit=total_product_number)}
  best = [Recommendation(produit_id=r["produit_id"], produit=id2nom.get(r["produit_id"]), score=r["score"]) for r in
          recos]
  return best


@router.get("/optimize/best-sell-range")
def bestSellRange(last_sell: int = 0, top_product_number_in_basket: int = 10,
                  total_product_number: Optional[int] = 0,
                  end: datetime = datetime.now(),
                  start: datetime = datetime.now().replace(day=1),
                  supprimer: int = 0,
                  db: Session = Depends(get_db)):
  if total_product_number == 0:
    total_product_number = ProduitRepository(db).get_total_count()
  # best sell
  baskets = ConcernerRepository(db).fetch_last_baskets_range(
    limit=last_sell,
    start=start,
    end=end,
    supprimer=supprimer,
  )
  recos = also_bought_from_baskets(baskets, top_k=top_product_number_in_basket, for_product=None)
  id2nom = {p["id"]: p["nom"] for p in get_products_basic(db, limit=total_product_number)}
  best = [Recommendation(produit_id=r["produit_id"], produit=id2nom.get(r["produit_id"]), score=r["score"]) for r in
          recos]
  return best


def _service_level(score: float) -> str:
  if score >= 85: return "excellent"
  if score >= 70: return "bon"
  if score >= 50: return "moyen"
  return "faible"


# CETTE FONCTION EST LA VERSION CORRECTE ET OPTIMISÉE
@router.get("/optimize-dashboard", tags=["Dashboard"])
def optimize_dashboard(db: Session = Depends(get_db),
                       page: int = 0,
                       size: int = 10,
                       horizon_days: int = 500,
                       search: Optional[str] = None):
  """
  Calcule l'état de santé du stock et génère des recommandations de réapprovisionnement.
  Cette route est la source de vérité pour le tableau de bord d'optimisation.
  Elle utilise le service centralisé `compute_replenishment_new` qui est performant
  et contient toute la logique métier.
  """
  # 1. Appel UNIQUE à la fonction service qui fait tout le travail lourd
  #    Cette fonction est conçue pour être efficace : elle ne fait pas de boucles avec des appels DB.
  recos = compute_replenishment_new(db,
                                    horizon_days=horizon_days,
                                    page=page, size=size, search=search)

  # Le reste du code traite les données déjà chargées en mémoire, c'est très rapide.
  def _days_of_cover(r):
    d = r.daily_mean if r.daily_mean > 0 else 0.0001
    return round(r.stock_actuel / d, 1)

  cmd_recos = [r for r in recos if r.qte_suggeree > 0]
  coverage_ok = [r for r in recos if r.stock_actuel >= r.rop]
  coverage_rate = round(100 * len(coverage_ok) / max(len(recos), 1), 1)

  # Calcul du score de santé global
  # (exemple de métrique métier)
  urgent_rate = 1 - (len(cmd_recos) / max(len(recos), 1))
  health_score = round(0.7 * coverage_rate + 30 * urgent_rate, 1)

  print("recos")
  print(recos)
  print(len(recos))
  # 2. Priorisation des produits les plus urgents (sous stock min ou ROP)
  priorities = sorted(
    recos,
    key=lambda r: (
      0 if (r.stock_min is not None and r.stock_actuel < r.stock_min) else 1,
      r.stock_actuel - r.rop
    )
  )[:20]

  print("priorities")
  print(priorities)

  # 3. Formatage de la réponse JSON avec des KPIs clairs
  top_products = [
    dict(
      id=r.produit_id,
      nom=r.produit_nom,
      classeABC=r.classe_abc,
      stock=r.stock_actuel,
      stockMin=r.stock_min,
      stockMax=r.stock_max,
      daysCover=_days_of_cover(r),  # Jours de couverture restants
      dailyMean=r.daily_mean,
      rop=r.rop,
      target=r.target_stock,
      qteSuggeree=r.qte_suggeree,
      risque=("élevé" if r.stock_actuel <= max(r.rop, r.stock_min or r.rop) else "faible")
    )
    for r in priorities
  ]

  return {
    "health": {"score": health_score, "level": _service_level(health_score)},
    "kpis": {
      "skus": len(recos),
      "toReorder": len(cmd_recos),
      "coverageRatePct": coverage_rate,
      "avgDailyDemand": round(mean([r.daily_mean for r in recos]) if recos else 0.0, 2)
    },
    "topProducts": top_products,
    "reorders": [
      dict(
        produitId=r.produit_id, nom=r.produit_nom,
        stock=r.stock_actuel, stockMin=r.stock_min, stockMax=r.stock_max,
        leadTime=r.lead_time, dailyMean=r.daily_mean, dailyStd=r.daily_std,
        rop=r.rop, target=r.target_stock, qte=r.qte_suggeree,
        classeABC=r.classe_abc, raison=r.raison
      )
      for r in cmd_recos
    ],
    "actions": []
  }
