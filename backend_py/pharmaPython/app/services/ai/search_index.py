# app/ai/search_index.py

from __future__ import annotations
from typing import List, Tuple, Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from app.models.produit import Produit  # ton modèle SQLAlchemy

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_index: Optional[faiss.IndexFlatIP] = None   # index FAISS (cosine via inner product)
_id_map: List[int] = []                      # position -> produit_id
_model: Optional[SentenceTransformer] = None
_dim: Optional[int] = None


def _get_model() -> SentenceTransformer:
  """Charge le modèle une seule fois et mémorise la dimension."""
  global _model, _dim
  if _model is None:
    _model = SentenceTransformer(MODEL_NAME)
    # MiniLM-L6-v2 -> 384 dims
    _dim = int(_model.get_sentence_embedding_dimension())
  return _model


def build_index(db: Session) -> None:
  """Construit l’index vectoriel à partir de tous les produits."""
  global _index, _id_map, _dim
  model = _get_model()

  rows: List[Tuple[int, str]] = [
    # (p.id, f"{p.nom or ''} {p.codebarre or ''}".strip())
    (p.id, f"{p.nom or ''} ".strip())
    for p in db.query(Produit).all()
  ]
  if not rows:
    _index = None
    _id_map = []
    return

  texts = [t for _, t in rows]
  embs = model.encode(texts, normalize_embeddings=True)
  embs = np.asarray(embs, dtype="float32")  # (N, dim)
  _dim = embs.shape[1]

  # Cosine = Inner Product sur vecteurs normalisés
  _index = faiss.IndexFlatIP(_dim)
  _index.add(embs)  # ajoute N vecteurs

  _id_map = [pid for pid, _ in rows]


def ensure_index(db: Optional[Session] = None) -> None:
  """Re-construit l’index si nécessaire (à l’appel de la recherche)."""
  if _index is None and db is not None:
    build_index(db)


def semantic_search(query: str, top_k: int = 10, db: Optional[Session] = None) -> List[int]:
  """
  Retourne une liste d'IDs de Produit, triés par similarité décroissante.
  Si l’index n’existe pas encore et que `db` est fourni, on le construit.
  """
  ensure_index(db)
  if _index is None or not _id_map:
    return []

  model = _get_model()
  q = model.encode([query], normalize_embeddings=True)
  q = np.asarray(q, dtype="float32")  # (1, dim)

  k = min(max(top_k, 1), len(_id_map))
  D, I = _index.search(q, k)  # I: indices dans l’index FAISS
  return [_id_map[i] for i in I[0] if i != -1]


def search_products_advance(query: str, top_k: int, db: Session) -> List[Produit]:
  """
  Variante pratique : renvoie directement les objets Produit dans le bon ordre.
  """
  ids = semantic_search(query, top_k=top_k, db=db)
  if not ids:
    return []

  order = {id_: idx for idx, id_ in enumerate(ids)}
  products = db.query(Produit).filter(Produit.id.in_(ids)).all()
  products.sort(key=lambda p: order.get(p.id, 10**9))  # préserve l’ordre FAISS
  return products
