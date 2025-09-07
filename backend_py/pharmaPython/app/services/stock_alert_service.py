# app/services/stock_alert_service.py
from __future__ import annotations

from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
import numpy as np
import pandas as pd
from datetime import date, timedelta, datetime

from app.models.en_rayon import EnRayon
from app.models.stock_alert import StockAlert
from app.models.produit import Produit
from app.models.vente import Vente
from app.models.concerner import Concerner

Z = 1.65  # 95%
HISTORY_DAYS = 900


def _daily_sales(db: Session) -> pd.DataFrame:
  since = date.today() - timedelta(days=HISTORY_DAYS)
  rows = (db.query(Vente.date_vente, EnRayon.produit_id,
                   func.sum(Concerner.quantite))
          .join(Concerner, Concerner.vente_id == Vente.id)
          .join(EnRayon, EnRayon.id == Concerner.en_rayon_id)
          .filter(Vente.date_vente >= since)
          .group_by(Vente.date_vente, EnRayon.produit_id)
          .all())
  if not rows:
    return pd.DataFrame(columns=["date", "produit_id", "qty"])
  df = pd.DataFrame(rows, columns=["date", "produit_id", "qty"])
  df["date"] = pd.to_datetime(df["date"]).dt.date
  return df


def _forecast_mean_std(series: pd.Series) -> tuple[float, float]:
  # index = dates journalières, valeurs = qty

  if series is None or len(series) == 0:
    return 0.0, 0.0

    # Assure un DatetimeIndex
  s = series.copy()
  if not isinstance(s.index, pd.DatetimeIndex):
    s.index = pd.to_datetime(s.index, errors="coerce")
  s = s.dropna(axis=0)  # retire dates non convertibles

  if s.empty:
    return 0.0, 0.0

  # 1) Agrège par jour pour éliminer les doublons (somme des ventes du même jour)
  s = s.groupby(s.index.normalize()).sum()

  # 2) Trie l’index (important pour date_range et rolling)
  s = s.sort_index()

  if s.empty:
    return 0.0, 0.0

  # 3) Reindex sur une grille quotidienne continue
  idx = pd.date_range(start=s.index.min(), end=s.index.max(), freq="D")
  # Pas d’erreur « duplicate labels » possible désormais
  y = s.reindex(idx, fill_value=0.0).astype(float)

  # 4) Lisse légèrement (optionnel) pour réduire le bruit
  #    (si tu ne veux pas lisser, commente ces 2 lignes)
  if len(y) >= 7:
    y = y.rolling(window=7, min_periods=1).mean()

  # 5) Statistiques de base
  mean = float(y.mean())
  std = float(y.std(ddof=1)) if len(y) > 1 else 0.0

  # 6) Si tu utilises un modèle saisonnier hebdo, tu peux
  #    pondérer mu par la saisonnalité détectée (optionnel).
  #    Ici on reste simple : on renvoie (mu, sigma).


  # w7  = y.tail(7).mean() if len(y) >= 7 else y.mean()
  # w14 = y.tail(14).mean() if len(y) >= 14 else w7
  # w28 = y.tail(28).mean() if len(y) >= 28 else w14
  # mean = float(0.5*w7 + 0.3*w14 + 0.2*w28)
  # std = float(y.tail(28).std() if len(y) >= 28 else y.std())
  # if np.isnan(std): std = 0.0
  return mean, std


def compute_and_store_alerts(db: Session) -> int:
  """Crée/MAJ des alertes OPEN; retourne le nombre d’alertes créées."""
  sales = _daily_sales(db)
  produits = db.query(Produit).all()
  # Map stock & lead time
  stock_map = {p.id: int(getattr(p, "stock", 0) or 0) for p in produits}
  lead_map = {p.id: int(getattr(p, "lead_time_jours", 7) or 7) for p in produits}
  # Demande journalière par produit
  created = 0
  grouped = sales.groupby("produit_id") if not sales.empty else []
  demand: dict[int, tuple[float, float]] = {}
  for pid, g in grouped:
    s = g.set_index("date")["qty"]
    demand[pid] = _forecast_mean_std(s)

  for p in produits:
    stock = stock_map.get(p.id, 0)
    mean, std = demand.get(p.id, (0.0, 0.0))
    lead = lead_map[p.id]
    mu_L = mean * lead
    sigma_L = std * (lead ** 0.5)
    rop = mu_L + Z * sigma_L
    days_left = (stock / mean) if mean > 0 else float("inf")

    # règles simples
    alerts: list[tuple[str, str, str]] = []
    if stock <= 0:
      alerts.append(("LOW_STOCK", "critical", f"{p.nom}: stock=0"))
    elif stock <= rop:
      alerts.append(("BELOW_ROP", "warning", f"{p.nom}: stock {stock} <= ROP {int(rop)}"))
    elif days_left != float("inf") and days_left <= 3:
      alerts.append(("OOS_RISK", "warning", f"{p.nom}: {days_left:.1f} jours restants"))

    for typ, sev, msg in alerts:
      # dédoublonner via contrainte unique produit_id+type+status=OPEN
      exists = (db.query(StockAlert)
                .filter(StockAlert.produit_id == p.id,
                        StockAlert.type == typ,
                        StockAlert.status == "OPEN")
                .first())
      if not exists:
        db.add(StockAlert(
          produit_id=p.id, type=typ, message=msg, severity=sev,
          stock=stock, rop=float(rop), days_left=None if mean == 0 else float(days_left),
          status="OPEN",
          created_at= datetime.now()
        ))
        created += 1
        # print(created)

  db.commit()
  return created


def acknowledge(db: Session, alert_id: int) -> None:
  a = db.query(StockAlert).get(alert_id)
  if a: a.status = "ACK"; db.commit()


def close(db: Session, alert_id: int) -> None:
  a = db.query(StockAlert).get(alert_id)
  if a: a.status = "CLOSED"; db.commit()
