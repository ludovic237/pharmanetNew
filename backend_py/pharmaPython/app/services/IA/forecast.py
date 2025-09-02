# app/ai/forecast.py
import pandas as pd
import numpy as np
from datetime import date
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sqlalchemy.orm import Session
from app.models.vente import Vente

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
