# app/ai/anomaly.py
import numpy as np
from sklearn.ensemble import IsolationForest
from sqlalchemy.orm import Session
from app.models.caisse import Caisse

def train_caisse_anomaly_model(db: Session) -> IsolationForest:
  data = []
  for c in db.query(Caisse).all():
    features = [
      float(c.fond_caisse_ouvert or 0),
      float(c.fond_caisse_ferme or 0),
      float(c.total_ventes or 0),
      float(c.total_retours or 0),
      float(c.total_depenses or 0),
    ]
    data.append(features)
  X = np.array(data) if data else np.zeros((1,5))
  model = IsolationForest(n_estimators=100, contamination=0.02, random_state=42)
  model.fit(X)
  return model

def score_caisse(model: IsolationForest, caisse: Caisse) -> float:
  x = np.array([[
    float(caisse.fond_caisse_ouvert or 0),
    float(caisse.fond_caisse_ferme or 0),
    float(caisse.total_ventes or 0),
    float(caisse.total_retours or 0),
    float(caisse.total_depenses or 0),
  ]])
  # Score : plus NEGATIF => plus anormal
  return float(model.decision_function(x)[0])
