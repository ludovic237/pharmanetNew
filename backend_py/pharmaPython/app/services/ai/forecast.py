# app/ai/forecast.py
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sqlalchemy.orm import Session
from app.models.vente import Vente
from typing import List, Tuple
from datetime import date, timedelta
import math

# Option 1: statsmodels pour Exponential Smoothing (si dispo)
try:
  import pandas as pd
  from statsmodels.tsa.holtwinters import ExponentialSmoothing
  _HAS_SM = True
except Exception:  # pandas/statsmodels non installés
  _HAS_SM = False

def load_daily_sales(db: Session) -> pd.Series:
  rows = (db.query(Vente.date_vente, Vente.prix_total)
          .filter(Vente.prix_total.isnot(None))
          .all())
  if not rows:
    idx = pd.date_range(end=date.today(), periods=30, freq="D")
    return pd.Series(0.0, index=idx)
  df = pd.DataFrame(rows, columns=["date", "total"])
  df = df.groupby("date")["total"].sum().sort_index()
  # Série journalière continue
  all_days = pd.date_range(df.index.min(), df.index.max(), freq="D")
  return df.reindex(all_days, fill_value=0.0)

def forecast_sales(db: Session, horizon_days: int = 14) -> pd.Series:
  y = load_daily_sales(db)
  # SARIMAX simple ; ajuste si besoin (p,d,q)(P,D,Q)s
  model = SARIMAX(y, order=(1,1,1), seasonal_order=(0,1,1,7), enforce_stationarity=False, enforce_invertibility=False)
  res = model.fit(disp=False)
  pred = res.forecast(steps=horizon_days)
  pred.index = pd.date_range(y.index[-1] + pd.Timedelta(days=1), periods=horizon_days, freq="D")
  return pred

def _moving_average(series: List[Tuple[date, float]], window: int = 7) -> float:
  vals = [v for _, v in series[-window:]] or [0.0]
  return sum(vals) / max(len(vals), 1)

def forecast_daily(series: List[Tuple[date, float]], horizon_days: int = 14) -> List[Tuple[date, float]]:
  """
  Input: [(date, qty)], output: [(future_date, yhat)]
  Fallback: simple moving average si statsmodels/pandas indisponibles.
  """
  if not series:
    today = date.today()
    return [(today + timedelta(days=i+1), 0.0) for i in range(horizon_days)]

  if _HAS_SM and len(series) >= 14:
    df = pd.DataFrame(series, columns=["ds", "y"]).set_index("ds").asfreq("D").fillna(0.0)
    try:
      model = ExponentialSmoothing(df["y"], trend="add", seasonal=None)
      fit = model.fit(optimized=True, use_brute=True)
      future = pd.date_range(df.index[-1] + timedelta(days=1), periods=horizon_days, freq="D")
      yhat = fit.forecast(horizon_days)
      return [(d.date(), max(0.0, float(v))) for d, v in zip(future, yhat)]
    except Exception:
      pass  # fallback

  avg = _moving_average(series, window=min(7, len(series)))
  start = series[-1][0]
  return [(start + timedelta(days=i+1), avg) for i in range(horizon_days)]
