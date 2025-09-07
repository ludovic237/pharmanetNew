# app/services/reorder_ai_service.py
from __future__ import annotations
from dataclasses import dataclass
from datetime import date, timedelta
from math import sqrt
from typing import Dict, List

from sqlalchemy.orm import Session

from app.repositories.produit_repository import ProduitRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.services.ai.forecasting import OnlineDemandForecaster


# si tu as une méthode incoming par produit :
# from app.repositories.commande_repository import CommandeRepository


@dataclass
class ReorderSuggestion:
  produit_id: int
  produit_nom: str
  stock_actuel: float
  stock_couverture_jours: float
  demande_leadtime: float
  stock_securite: float
  rop: float
  on_order: float
  qty_suggereree: int  # arrondi
  raison: str

def _z_for_service_level(alpha: float) -> float:
  # approx pour 0.5..0.999 (95% ~ 1.64)
  from math import sqrt, pi, log
  # approximation de Beasley-Springer/Moro (simple)
  # pour rester court, on retourne des valeurs usuelles :
  return 1.28 if alpha <= 0.9 else (1.64 if alpha <= 0.95 else 2.05)

def suggest_reorders(
  db: Session,
  forecaster: OnlineDemandForecaster,
  horizon_days: int = 14,
  lead_time_days: int = 3,
  service_level: float = 0.95,
  min_order_qty: int = 1,
) -> List[ReorderSuggestion]:

  produit_repo = ProduitRepository(db)
  enrayon_repo = EnRayonRepository(db)
  produits = produit_repo.find_all_sellable_ids_and_names()  # [(id, nom)]
  product_ids = [pid for pid, _ in produits]

  # stock courant
  stock_map: Dict[int, float] = enrayon_repo.sum_stock_by_product(product_ids)

  # incoming sur commandes (si tu as)
  on_order_map: Dict[int, float] = {}  # CommandeRepository(db).incoming_qty_by_product(product_ids)
  on_order_map = {pid: on_order_map.get(pid, 0.0) for pid in product_ids}

  suggestions: List[ReorderSuggestion] = []
  today = date.today()
  z = _z_for_service_level(service_level)

  for pid, nom in produits:
    stock = stock_map.get(pid, 0.0)
    # demande prévue sur lead time
    d_lt = forecaster.predict_horizon(pid, today, lead_time_days)
    sigma = forecaster.recent_std(pid, days=max(lead_time_days * 4, 28))
    # stock de sécurité (suppose indépendance jour/jour)
    ss = z * sigma * sqrt(max(1, lead_time_days))
    rop = d_lt + ss

    incoming = on_order_map.get(pid, 0.0)
    gap = rop - (stock + incoming)
    qty = int(max(0, round(gap)))

    # Couverture (jours de vente) si dispo
    d14 = forecaster.predict_horizon(pid, today, 14) or 0.0001
    daily = d14 / 14.0
    couverture = (stock / daily) if daily > 0 else float('inf')

    if qty >= min_order_qty:
      suggestions.append(ReorderSuggestion(
        produit_id=pid,
        produit_nom=nom,
        stock_actuel=stock,
        stock_couverture_jours=couverture,
        demande_leadtime=d_lt,
        stock_securite=ss,
        rop=rop,
        on_order=incoming,
        qty_suggereree=qty,
        raison="Stock + entrées futures < ROP (demande sur lead time + stock sécurité)"
      ))

  # tri: d’abord ceux qui vont tomber en rupture
  suggestions.sort(key=lambda s: (s.stock_actuel + s.on_order) - s.rop)
  return suggestions
