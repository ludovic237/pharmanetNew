# app/ai/search_index.py
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.produit import Produit

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # léger, CPU ok
_index = None
_id_map: List[int] = []
_model: SentenceTransformer | None = None

def build_index(db: Session) -> None:
  global _index, _id_map, _model
  _model = _model or SentenceTransformer(MODEL_NAME)
  rows: List[Tuple[int, str]] = [(p.id, f"{p.nom} {p.codebarre or ''}") for p in db.query(Produit).all()]
  if not rows:
    _index = None
    _id_map = []
    return
  texts = [t for _, t in rows]
  embs = _model.encode(texts, normalize_embeddings=True)
  _index = faiss.IndexFlatIP(embs.shape[1])  # cos sim par produit scalaire sur vecteurs normalisés
  _index.add(np.array(embs, dtype=np.float32))
  _id_map = [pid for pid, _ in rows]

def semantic_search(query: str, top_k: int = 10) -> List[int]:
  if _index is None:
    return []
  q = _model.encode([query], normalize_embeddings=True).astype("float32")
  D, I = _index.search(q, top_k)
  return [_id_map[i] for i in I[0]]
