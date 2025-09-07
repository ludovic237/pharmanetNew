# app/ai/replenishment.py
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta
from typing import Iterable, Optional, List, Dict, Any, Tuple

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.en_rayon import EnRayon
# === Modèles SQLAlchemy supposés ===
# Produit(id, nom, fournisseur_id, min_lot, lead_time_jours, categorie_id, supprimer)
# EnRayon (stock_dispo, produit_id, ... )  OU Produit.stock (selon ton modèle)
# Vente(date_vente, prix_total, ...)
# Concerner(vente_id, produit_id, quantite, prix_unit)
from app.models.produit import Produit
from app.models.concerner import Concerner
from app.models.vente import Vente

# --------------------------
# Paramètres globaux
# --------------------------
DEFAULT_LEAD_TIME = 7          # jours si non rempli sur le produit
SERVICE_LEVEL_Z = 1.65         # ~95%
MIN_HISTORY_DAYS = 90
COVERAGE_DAYS = 21             # stock-cible pour tenue (période de couverture)
USE_SARIMAX = False            # True si tu veux seasonal weekly

@dataclass
class RecoCommande:
  """
   Data class representing a replenishment recommendation for a product.
   """
  produit_id: int
  produit_nom: str
  stock_actuel: int
  lead_time: int
  daily_mean: float
  daily_std: float
  mu_L: float
  sigma_L: float
  safety_stock: float
  rop: float
  target_stock: float
  qte_suggeree: int
  classe_abc: str
  raison: str

# ---------- Utils ------------
def _group_daily_sales(db: Session, days: int = 180) -> pd.DataFrame:
  """
  Retourne un DF: date, produit_id, qty (quantité vendue / jour / produit)
  """

  """
    Groups daily sales data by product and returns a DataFrame.

    Args:
        db (Session): The database session.
        days (int): Number of days to consider for sales history.

    Returns:
        pd.DataFrame: DataFrame with columns ['date', 'produit_id', 'qty'].
    """
  since = date.today() - timedelta(days=days)
  rows = (
    db.query(Vente.date_vente, EnRayon.produit_id, func.sum(Concerner.quantite))
    .join(Concerner, Concerner.vente_id == Vente.id)
    .join(EnRayon, EnRayon.id == Concerner.en_rayon_id)
    .filter(Vente.date_vente >= since)
    .group_by(Vente.date_vente, EnRayon.produit_id)
    .all()
  )
  print("len(rows)")
  print(len(rows))
  print(rows)
  if not rows:
    return pd.DataFrame(columns=["date", "produit_id", "qty"], dtype=float)
  df = pd.DataFrame(rows, columns=["date", "produit_id", "qty"])
  df["date"] = pd.to_datetime(df["date"]).dt.date
  return df

def _abc_classes(db: Session, days: int = 180) -> dict[int, str]:
  """
  Classe ABC sur CA recent par produit. Retourne {produit_id: 'A'|'B'|'C'}
  """

  """
    Classifies products into ABC categories based on recent revenue.

    Args:
        db (Session): The database session.
        days (int): Number of days to consider for revenue calculation.

    Returns:
        dict[int, str]: Mapping of product IDs to their ABC class ('A', 'B', or 'C').
    """
  since = date.today() - timedelta(days=days)
  rows = (
    db.query(Concerner.produit_id, func.sum(Concerner.quantite * Concerner.prix_unit))
    .join(Vente, Vente.id == Concerner.vente_id)
    .filter(Vente.date_vente >= since)
    .group_by(Concerner.produit_id)
    .all()
  )
  if not rows:
    return {}
  df = pd.DataFrame(rows, columns=["produit_id", "ca"])
  df = df.sort_values("ca", ascending=False)
  df["cum"] = df["ca"].cumsum() / df["ca"].sum()
  def label(x):
    if x <= 0.2: return "A"
    if x <= 0.5: return "B"
    return "C"
  df["classe"] = df["cum"].apply(label)
  return dict(zip(df["produit_id"], df["classe"]))

def _stock_dispo(db: Session) -> dict[int, int]:
  """
  Retourne le stock actuel par produit_id.
  Adapte selon ton modèle (EnRayon / ProduitDetail / Produit.stock).
  """

  """
    Retrieves the current stock for each product.

    Args:
        db (Session): The database session.

    Returns:
        dict[int, int]: Mapping of product IDs to their current stock.
    """
  # Exemple si tu stockes au niveau produit (simplifié)
  rows = db.query(Produit.id, Produit.stock).all() if hasattr(Produit, "stock") else []
  return {pid: int(stock or 0) for pid, stock in rows}

def _lead_time_for(p: Produit) -> int:
  """
    Retrieves the lead time for a product.

    Args:
        p (Produit): The product instance.

    Returns:
        int: The lead time in days.
    """
  return int(DEFAULT_LEAD_TIME)
  # return int(p.lead_time_jours or DEFAULT_LEAD_TIME)

# ---------- Prévision simple par SKU ----------
def _forecast_daily(df_prod: pd.Series) -> tuple[float, float]:
  """
  df_prod = Series indexée par date, valeurs qty (jour)
  Retourne (mean, std) de la demande journalière prévue.
  """

  """
    Forecasts daily demand for a product.

    Args:
        df_prod (pd.Series): Time series of daily sales quantities.

    Returns:
        tuple[float, float]: Mean and standard deviation of the forecasted daily demand.
    """
  if df_prod.empty:
    return 0.0, 0.0
  # Série régulière (jours manquants = 0)
  idx = pd.date_range(df_prod.index.min(), df_prod.index.max(), freq="D")
  y = df_prod.reindex(idx, fill_value=0.0).astype(float)

  if USE_SARIMAX and len(y) >= MIN_HISTORY_DAYS:
    try:
      from statsmodels.tsa.statespace.sarimax import SARIMAX
      model = SARIMAX(y, order=(1,1,1), seasonal_order=(0,1,1,7),
                      enforce_stationarity=False, enforce_invertibility=False)
      res = model.fit(disp=False)
      # Prévision court terme (prochaine semaine pour estimer mean/std)
      f = res.get_forecast(steps=7)
      mean = float(f.predicted_mean.mean())
      std = float(np.sqrt(np.maximum(f.var_pred_mean.mean(), 0.0)))
      return mean, std
    except Exception:
      pass

  # Fallback moyenne mobile pondérée (7j, 14j, 28j)
  w7  = y.tail(7).mean() if len(y) >= 7 else y.mean()
  w14 = y.tail(14).mean() if len(y) >= 14 else w7
  w28 = y.tail(28).mean() if len(y) >= 28 else w14
  mean = float((0.5*w7 + 0.3*w14 + 0.2*w28))
  std = float(y.tail(28).std() if len(y) >= 28 else y.std())
  if np.isnan(std): std = 0.0
  return mean, std

# ---------- Reco principale ----------
def compute_replenishment(db: Session) -> list[RecoCommande]:
  """
    Computes replenishment recommendations for all products.

    Args:
        db (Session): The database session.

    Returns:
        list[RecoCommande]: List of replenishment recommendations.
    """
  sales = _group_daily_sales(db, days=max(180, MIN_HISTORY_DAYS))
  abc = _abc_classes(db, days=180)
  stock_map = _stock_dispo(db)
  # Mise en forme: dict produit_id -> series qty/jour
  recos: list[RecoCommande] = []
  if sales.empty:
    # Aucun historique: rien à recommander
    return recos

  for pid, sdf in sales.groupby("produit_id"):
    s = sdf.set_index("date")["qty"]
    s.index = pd.to_datetime(s.index)

    daily_mean, daily_std = _forecast_daily(s)
    p: Produit = db.query(Produit).get(pid)  # type: ignore
    if p is None or getattr(p, "supprimer", 0) == 1:
      continue

    lead = _lead_time_for(p)
    mu_L = daily_mean * lead
    sigma_L = daily_std * np.sqrt(max(lead, 1))
    safety = SERVICE_LEVEL_Z * sigma_L
    rop = mu_L + safety

    stock = stock_map.get(pid, 0)

    # Couverture cible (ABC)
    classe = abc.get(pid, "C")
    cov = COVERAGE_DAYS if classe == "A" else (int(COVERAGE_DAYS*0.75) if classe == "B" else int(COVERAGE_DAYS*0.5))
    target_stock = daily_mean * max(cov, lead)

    min_lot = int(getattr(p, "min_lot", 1) or 1)
    q = 0
    raison = ""
    if stock <= rop:
      manque = max(0, int(round(target_stock - stock)))
      # arrondir au multiple de min_lot
      q = int(max(min_lot, ( (manque + min_lot - 1) // min_lot ) * min_lot))
      raison = f"Stock ({stock}) <= ROP ({int(rop)})"

    recos.append(RecoCommande(
      produit_id=pid,
      produit_nom=p.nom,
      stock_actuel=stock,
      lead_time=lead,
      daily_mean=float(round(daily_mean, 3)),
      daily_std=float(round(daily_std, 3)),
      mu_L=float(round(mu_L, 3)),
      sigma_L=float(round(sigma_L, 3)),
      safety_stock=float(round(safety, 3)),
      rop=float(round(rop, 3)),
      target_stock=float(round(target_stock, 3)),
      qte_suggeree=q,
      classe_abc=classe,
      raison=raison
    ))

  # Prioriser: d’abord ceux avec q>0, ensuite par classe A>B>C puis manque le plus grand
  recos.sort(key=lambda r: (r.qte_suggeree == 0, {"A":0,"B":1,"C":2}.get(r.classe_abc,3), -(r.target_stock - r.stock_actuel)))
  return recos

# ---------- Générer des commandes d’achat (PO) ----------
def generate_purchase_orders(db: Session) -> list[Dict[str, Any]]:
  """
  Crée des propositions de commandes groupées par fournisseur (sans commit),
  retourne payload JSON exploitable par le front.
  """

  """
    Generates purchase orders grouped by supplier.

    Args:
        db (Session): The database session.

    Returns:
        list[Dict[str, Any]]: List of purchase orders.
    """

  recos = compute_replenishment(db)
  print("recos")
  print(recos)
  # Filtrer ceux à commander
  to_order = [r for r in recos if r.qte_suggeree > 0]
  if not to_order:
    return []

  # Charger produits pour récupérer fournisseur
  produits = {p.id: p for p in db.query(Produit).filter(Produit.id.in_([r.produit_id for r in to_order])).all()}
  print("produits")
  print(produits)
  # Groupage par fournisseur
  grouped: dict[int, list[RecoCommande]] = {}
  for r in to_order:
    f = getattr(produits[r.produit_id], "fournisseur_id", None) or 0
    grouped.setdefault(int(f), []).append(r)

  po_list = []
  print("grouped")
  print(grouped)
  for fournisseur_id, items in grouped.items():
    lignes = [
      dict(produitId=r.produit_id, nom=r.produit_nom, qte=r.qte_suggeree, raison=r.raison)
      for r in items
    ]
    po_list.append(dict(
      fournisseurId=fournisseur_id,
      date=str(date.today()),
      lignes=lignes
    ))
  return po_list


def compute_safety_stock(daily_demand: List[Tuple[date, float]], lead_time_days: int = 7, service_level_z: float = 1.65) -> float:
  """
  Stock de sécurité = z * σ_d * sqrt(L)
  σ_d = écart-type de la demande journalière.
  """

  """
    Computes the safety stock based on daily demand and lead time.

    Args:
        daily_demand (List[Tuple[date, float]]): Daily demand data.
        lead_time_days (int): Lead time in days.
        service_level_z (float): Z-score for the desired service level.

    Returns:
        float: Safety stock quantity.
    """
  if not daily_demand:
    return 0.0
  vals = [v for _, v in daily_demand]
  mean = sum(vals) / len(vals)
  var = sum((v - mean) ** 2 for v in vals) / max(len(vals)-1, 1)
  std = math.sqrt(var)
  return max(0.0, service_level_z * std * math.sqrt(max(lead_time_days, 1)))

def compute_reorder_point(avg_daily_demand: float, lead_time_days: int, safety_stock: float) -> float:
  """
    Computes the reorder point.

    Args:
        avg_daily_demand (float): Average daily demand.
        lead_time_days (int): Lead time in days.
        safety_stock (float): Safety stock quantity.

    Returns:
        float: Reorder point.
    """
  return max(0.0, avg_daily_demand * lead_time_days + safety_stock)

def suggested_order_qty(current_stock: float, forecast_next_days: float, reorder_point: float, target_coverage_days: int, avg_daily_demand: float) -> float:
  """
  Si stock < point de commande, on remonte jusqu’à target_coverage_days.
  """

  """
    Generate product recommendations based on basket data.

    Args:
        baskets (List[List[int]]): A list of baskets, where each basket is a list of product IDs.
        top_k (int): The number of top recommendations to return. Default is 8.
        for_product (Optional[int]): The product ID for which recommendations are generated. If None, global recommendations are returned.

    Returns:
        List[Dict[str, Any]]: A list of dictionaries containing recommended product IDs and their scores.
    """
  # Initialize the co-occurrence matrix
  if current_stock >= reorder_point:
    return 0.0
  target_stock = avg_daily_demand * target_coverage_days
  qty = max(0.0, target_stock - current_stock)
  return round(qty, 2)
