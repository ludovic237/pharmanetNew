# app/ai/anomaly.py
import math
from datetime import date
from typing import Tuple, List

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.utils.validation import check_is_fitted
from sqlalchemy.orm import Session
from app.models.caisse import Caisse
from app.repositories.caisse_repository import CaisseRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.repositories.depense_repository import DepenseRepository
from app.repositories.produit_retour_repository import ProduitRetourRepository
from app.repositories.retour_produit_repository import RetourProduitRepository
from app.repositories.vente_repository import VenteRepository

def _ensure_fitted(model: IsolationForest, db: Session) -> IsolationForest:
  """
  _ensure_fitted vérifie/entraîne le modèle si nécessaire.

  """
  """
    Ensure that the IsolationForest model is fitted. If not, train it.

    Args:
        model (IsolationForest): The IsolationForest model to check.
        db (Session): The database session.

    Returns:
        IsolationForest: The fitted IsolationForest model.
    """
  try:
    check_is_fitted(model)
    return model
  except Exception:
    # pas fitted -> on l’entraîne maintenant
    return train_caisse_anomaly_model(db)

def train_caisse_anomaly_model(db: Session) -> IsolationForest:
  """
  train_caisse_anomaly_model assemble des features caisse (fonds ouvert/fermé, quantités vendues, retours, dépenses) et entraîne le modèle
  """
  """
    Train an IsolationForest model using caisse-related data.

    Args:
        db (Session): The database session.

    Returns:
        IsolationForest: The trained IsolationForest model.
    """
  data = []
  for c in db.query(Caisse).all():
    depense_repo = DepenseRepository(db)
    depenses = depense_repo.find_by_caisse_id(str(c.id)) or []
    total_depenses = sum(
      (int(getattr(x, "quantite", 0) or 0) * int(getattr(x, "prix_unitaire", 0) or 0)) for x in (depenses or []))
    total_depenses_quatite = sum((int(getattr(x, "quantite", 0) or 0)) for x in (depenses or []))

    retour_repo = RetourProduitRepository(db)
    produit_retour_repo = ProduitRetourRepository(db)
    retour_produits = retour_repo.find_by_caisse(c) or []
    produit_retour_list = produit_retour_repo.find_by_retour_produit_in(retour_produits) or []
    total_produit_retour = sum(int(getattr(x, "quantite", 0) or 0) for x in (produit_retour_list or []))
    # total_retours = sum((int(getattr(x, "quantite", 0) or 0)*int(getattr(x, "quantite", 0) or 0)) for x in (retour_produits or []))

    vente_repo = VenteRepository(db)
    concerner_repo = ConcernerRepository(db)
    ventes = vente_repo.find_by_caisse_id_and_prix_percu_gte(c.id, 0.0) or []
    total_ventes = sum((int(getattr(x, "prix_total", 0) or 0)) for x in (ventes or []))
    total_ventes_qte = 0
    for vente in ventes:
      concerner_list = concerner_repo.find_by_vente_id(int(vente.id)) or []
      for concerne in concerner_list:
        quantite = int(getattr(concerne, "quantite", 0) or 0)
        total_ventes_qte = total_ventes_qte + quantite

    features = [
      float(c.fond_caisse_ouvert or 0),
      float(c.fond_caisse_ferme or 0),
      float(total_ventes_qte or 0),
      float(total_produit_retour or 0),
      float(total_depenses_quatite or 0),
    ]
    data.append(features)
  X = np.array(data) if data else np.zeros((1, 5))
  model = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)
  model.fit(X)
  return model


def score_caisse(db: Session, model: IsolationForest, caisse_id: int) -> float:
  """
    Calculate the anomaly score for a specific caisse.

    Args:
        db (Session): The database session.
        model (IsolationForest): The IsolationForest model.
        caisse_id (int): The ID of the caisse to score.

    Returns:
        float: The anomaly score (negative values indicate higher anomaly).
    """
  model = _ensure_fitted(model, db)

  caisse_repo = CaisseRepository(db)
  caisse = caisse_repo.find_by_id(caisse_id)

  depense_repo = DepenseRepository(db)
  depenses = depense_repo.find_by_caisse_id(str(caisse.id)) or []
  total_depenses_quatite = sum(int(getattr(x, "quantite", 0) or 0) for x in depenses)

  retour_repo = RetourProduitRepository(db)
  produit_retour_repo = ProduitRetourRepository(db)
  retour_produits = retour_repo.find_by_caisse(caisse) or []
  produit_retour_list = produit_retour_repo.find_by_retour_produit_in(retour_produits) or []
  total_produit_retour = sum(int(getattr(x, "quantite", 0) or 0) for x in produit_retour_list)

  vente_repo = VenteRepository(db)
  concerner_repo = ConcernerRepository(db)
  ventes = vente_repo.find_by_caisse_id_and_prix_percu_gte(caisse.id, 0.0) or []
  total_ventes_qte = 0
  for vente in ventes:
    for concerne in (concerner_repo.find_by_vente_id(int(vente.id)) or []):
      total_ventes_qte += int(getattr(concerne, "quantite", 0) or 0)

  x = np.array([[
    float(caisse.fond_caisse_ouvert or 0),
    float(caisse.fond_caisse_ferme or 0),
    float(total_ventes_qte or 0),
    float(total_produit_retour or 0),
    float(total_depenses_quatite or 0),
  ]])

  # score négatif => plus anormal
  return float(model.decision_function(x)[0])

def zscore_anomalies(series: List[Tuple[date, float]], z: float = 2.5):
  """
   Detect anomalies in a time series using Z-score.

   Args:
       series (List[Tuple[date, float]]): The time series data as a list of (date, value) tuples.
       z (float): The Z-score threshold for anomaly detection. Default is 2.5.

   Returns:
       List[Tuple[date, float, float]]: A list of anomalies with their Z-scores.
   """

  if not series:
    return []
  vals = [v for _, v in series]
  mean = sum(vals) / len(vals)
  var = sum((v - mean) ** 2 for v in vals) / max(len(vals) - 1, 1)
  std = math.sqrt(var) or 1.0
  out = []
  for d, v in series:
    zsc = (v - mean) / std
    if abs(zsc) >= z:
      out.append((d, v, zsc))
  return out
