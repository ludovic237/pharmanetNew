# app/ai/autocomplete.py
from functools import lru_cache
from sentence_transformers import SentenceTransformer
import numpy as np
from sqlalchemy.orm import Session
from app.models.produit import Produit

_model = None
_vectors = None
_labels = None

def _ensure_model():
  global _model
  if _model is None:
    _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def build_vocab(db: Session):
  global _vectors, _labels
  _ensure_model()
  prods = db.query(Produit.id, Produit.nom).all()
  _labels = [f"{pid}:{nom}" for pid, nom in prods]
  _vectors = _model.encode([nom for _, nom in prods], normalize_embeddings=True)

@lru_cache(maxsize=512)
def suggest(prefix: str, k: int = 8):
  _ensure_model()
  if _vectors is None or len(_vectors) == 0:
    return []
  q = _model.encode([prefix], normalize_embeddings=True)
  sims = np.dot(_vectors, q[0])
  idx = np.argsort(-sims)[:k]
  return [ _labels[i] for i in idx ]
