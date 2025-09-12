# app/ai/reco.py
from collections import defaultdict
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session
from app.models.vente import Vente
from app.models.concerner import Concerner

# Construire la matrice co-occurences {prod -> {autre_prod: score}}
def build_cooccur(db: Session) -> dict[int, dict[int, int]]:
  # On parcourt les ventes et lignes (concerner)

  """
   Build a co-occurrence matrix for products based on sales data.

   Args:
       db (Session): The database session.

   Returns:
       dict[int, dict[int, int]]: A dictionary where the keys are product IDs, and the values are dictionaries
       mapping other product IDs to their co-occurrence scores.
   """
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
  """
   Recommend products based on co-occurrence scores for a given product.

   Args:
       co (dict[int, dict[int, int]]): The co-occurrence matrix.
       produit_id (int): The product ID for which recommendations are generated.
       top_k (int): The number of top recommendations to return. Default is 5.

   Returns:
       list[tuple[int, int]]: A list of tuples containing recommended product IDs and their scores.
   """
  # Retrieve and sort co-occurrence scores for the given product
  pairs = sorted(co.get(produit_id, {}).items(), key=lambda kv: kv[1], reverse=True)
  return pairs[:top_k]

def also_bought_from_baskets(baskets: List[List[int]], top_k: int = 8, for_product: Optional[int] = None) -> List[Dict[str, Any]]:
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
  co = defaultdict(lambda: defaultdict(int))  # co[a][b] = co-occurrence
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
