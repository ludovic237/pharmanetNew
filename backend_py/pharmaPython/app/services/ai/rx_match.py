from typing import List, Dict, Tuple
from rapidfuzz import process, fuzz
import faiss
from sentence_transformers import SentenceTransformer

from sqlalchemy.orm import Session
from app.repositories.produit_repository import ProduitRepository

# charge un modèle compact (ou celui que tu utilises déjà)
_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
_index = None
_id2row: List[Tuple[int, str]] = []

def build_product_index(db: Session):
  global _index, _id2row
  rows = ProduitRepository(db).list_id_and_name_with_synonyms()  # [(id, "nom [synonymes]"), ...]
  texts = [name for _, name in rows]
  emb = _model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
  dim = emb.shape[1]
  _index = faiss.IndexFlatIP(dim)
  _index.add(emb)
  _id2row = rows

def match_drug(q: str, top_k: int = 5) -> List[Dict]:
  if _index is None:
    return []
  vec = _model.encode([q], normalize_embeddings=True, convert_to_numpy=True)
  D, I = _index.search(vec, top_k)
  out = []
  for score, idx in zip(D[0], I[0]):
    pid, label = _id2row[int(idx)]
    out.append({"produit_id": pid, "label": label, "score": float(score)})
  # fallback fuzzy si très faible
  if not out or out[0]["score"] < 0.35:
    choices = [label for _, label in _id2row]
    best = process.extract(q, choices, scorer=fuzz.WRatio, limit=top_k)
    # best => [(label, score, index)]
    out = [{"produit_id": _id2row[i][0], "label": lab, "score": sc/100.0} for lab, sc, i in best]
  return out
