# app/ai/reco.py
from collections import defaultdict
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session
from app.models.vente import Vente
from app.models.concerner import Concerner

# Construire la matrice co-occurences {prod -> {autre_prod: score}}
def build_cooccur(db: Session) -> dict[int, dict[int, int]]:
  # On parcourt les ventes et lignes (concerner)
  ventes = db.query(Vente.id).all()
  lines_by_vente = defaultdict(list)
  for v_id, in ventes:
    lignes = db.query(Concerner.produit_id).filter(Concerner.vente_id == v_id).all()
    lines_by_vente[v_id] = [pid for (pid,) in lignes]

  co = defaultdict(lambda: defaultdict(int))
  for v_id, prods in lines_by_vente.items():
    uniq = list(set(prods))
    for i, pid in enumerate(uniq):
      for j, pid2 in enumerate(uniq):
        if pid != pid2:
          co[pid][pid2] += 1
  return co

def recommend_for_product(co: dict[int, dict[int, int]], produit_id: int, top_k: int = 5) -> list[tuple[int, int]]:
  pairs = sorted(co.get(produit_id, {}).items(), key=lambda kv: kv[1], reverse=True)
  return pairs[:top_k]

def also_bought_from_baskets(baskets: List[List[int]], top_k: int = 8, for_product: Optional[int] = None) -> List[Dict[str, Any]]:
  """
  baskets: liste de paniers [ [prod_ids...], ... ]
  """
  print("defaultdict")
  print(defaultdict)
  co = defaultdict(lambda: defaultdict(int))  # co[a][b] = co-occurrence
  print("co")
  print(co)
  for b in baskets:
    uniq = list(set(b))
    for i in range(len(uniq)):
      for j in range(i+1, len(uniq)):
        a, c = uniq[i], uniq[j]
        co[a][c] += 1
        co[c][a] += 1

  recos = []
  if for_product is not None:
    pairs = co.get(for_product, {})
    recos = sorted(
      [{"produit_id": k, "score": float(v)} for k, v in pairs.items()],
      key=lambda x: x["score"], reverse=True
    )[:top_k]
  else:
    # top global (popularité simple)
    pop = defaultdict(int)
    for a, vs in co.items():
      pop[a] = sum(vs.values())
    recos = sorted(
      [{"produit_id": k, "score": float(v)} for k, v in pop.items()],
      key=lambda x: x["score"], reverse=True
    )[:top_k]
  return recos
