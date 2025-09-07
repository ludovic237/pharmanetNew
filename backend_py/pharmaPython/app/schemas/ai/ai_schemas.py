from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

class ForecastPoint(BaseModel):
  date: date
  yhat: float

class ForecastResponse(BaseModel):
  produit_id: int
  horizon_days: int
  history_days: int
  forecast: List[ForecastPoint]

class ReplenishmentSuggestion(BaseModel):
  produit_id: int
  current_stock: float
  safety_stock: float
  reorder_point: float
  suggested_order_qty: float
  rationale: str

class StockAlert(BaseModel):
  produit_id: int
  produit: Optional[str]
  current_stock: float
  threshold: float
  urgency: str  # "LOW" | "MEDIUM" | "HIGH"

class Recommendation(BaseModel):
  produit_id: int
  produit: Optional[str]
  score: float

class RecommendationsResponse(BaseModel):
  for_produit_id: Optional[int] = None
  recommendations: List[Recommendation] = []

class AnomalyPoint(BaseModel):
  date: date
  value: float
  zscore: float

class AnomalyResponse(BaseModel):
  metric: str
  anomalies: List[AnomalyPoint]

class OptimizeDashboardResponse(BaseModel):
  best_sellers: List[Recommendation]
  low_stock: List[StockAlert]
  reorder_suggestions: List[ReplenishmentSuggestion]
