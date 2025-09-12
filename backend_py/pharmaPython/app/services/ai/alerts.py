from typing import List, Dict, Any
from datetime import date, timedelta

def build_stock_alerts(rows: List[Dict[str, Any]], low_threshold: float = 5.0) -> List[Dict[str, Any]]:
  """
  rows: [{"produit_id": int, "produit": str, "stock": float, "threshold": float?}, ...]
  """
  alerts = []
  for r in rows:
    th = float(r.get("threshold", low_threshold))
    stock = float(r.get("stock", 0))
    urgency = "LOW"
    if stock <= 0:
      urgency = "HIGH"
    elif stock <= th:
      urgency = "MEDIUM"
    alerts.append({
      "max": r.get("max"),
      "min": r.get("min"),
      "produit_id": r["produit_id"],
      "produit": r.get("produit"),
      "current_stock": stock,
      "threshold": th,
      "urgency": urgency,
      "severity": urgency,
    })
  return alerts
