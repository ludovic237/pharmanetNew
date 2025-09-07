# app/ai/forecasting.py
from __future__ import annotations
from dataclasses import dataclass
from collections import defaultdict, deque
from datetime import date, timedelta
from typing import Deque, Dict, Iterable, List, Tuple

import numpy as np
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

@dataclass
class _Hist:
  last_qty: Deque[float]
  last_dates: Deque[date]

class OnlineDemandForecaster:
  """
  Un modèle incrémental par produit: X = [dow, month, lag1, lag7, ma7, trend]
  - update(product_id, d, qty): apprend 1 point
  - predict_horizon(product_id, start_date, horizon_days): somme prévisionnelle
  """
  def __init__(self, window: int = 56):
    self.models: Dict[int, any] = {}
    self.hist: Dict[int, _Hist] = defaultdict(lambda: _Hist(deque(maxlen=365), deque(maxlen=365)))
    self.window = window

  def _ensure_model(self, pid: int):
    if pid not in self.models:
      # pipeline standardisation + SGD (s'améliore en partial_fit)
      model = make_pipeline(
        StandardScaler(with_mean=False),
        SGDRegressor(loss="huber", learning_rate="optimal", max_iter=1, tol=None)
      )
      # initialisation avec une forme X pour partial_fit
      X0 = np.zeros((1, 1))  # on va appeler partial_fit avec les vraies features plus tard
      y0 = np.array([0.0])
      try:
        model.named_steps['sgdregressor'].partial_fit(X0, y0)
      except Exception:
        pass
      self.models[pid] = model

  def _features(self, d: date, pid: int) -> np.ndarray:
    h = self.hist[pid]
    # lags
    lag1 = float(h.last_qty[-1]) if len(h.last_qty) >= 1 else 0.0
    lag7 = float(h.last_qty[-7]) if len(h.last_qty) >= 7 else lag1
    # moving average
    tail = list(h.last_qty)[-7:] or [0.0]
    ma7 = float(np.mean(tail))
    # calendaires
    dow = d.weekday()  # 0=lundi
    month = d.month
    # tendance
    trend = len(h.last_qty)

    return np.array([dow, month, lag1, lag7, ma7, trend], dtype=float).reshape(1, -1)

  def update(self, pid: int, d: date, qty: float):
    self._ensure_model(pid)
    X = self._features(d, pid)
    y = np.array([float(qty)])
    self.models[pid].named_steps['sgdregressor'].partial_fit(X, y)
    self.hist[pid].last_qty.append(float(qty))
    self.hist[pid].last_dates.append(d)

  def predict_day(self, pid: int, d: date) -> float:
    self._ensure_model(pid)
    X = self._features(d, pid)
    y = self.models[pid].predict(X)[0]
    return max(0.0, float(y))

  def predict_horizon(self, pid: int, start_date: date, horizon_days: int) -> float:
    # roll-forward (auto-régression sur lags)
    total = 0.0
    tmp_hist = deque(self.hist[pid].last_qty, maxlen=365)
    for i in range(horizon_days):
      cur = start_date + timedelta(days=i)
      # temp inject: les features utilisent hist → on remplace last_qty[-1] dynamiquement
      self.hist[pid].last_qty = tmp_hist
      y = self.predict_day(pid, cur)
      total += y
      tmp_hist.append(y)
    # restore
    self.hist[pid].last_qty = tmp_hist
    return float(total)

  def recent_std(self, pid: int, days: int = 28) -> float:
    arr = np.array(list(self.hist[pid].last_qty)[-days:] or [0.0], dtype=float)
    return float(np.std(arr)) if arr.size else 0.0
