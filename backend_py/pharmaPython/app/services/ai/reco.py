# app/ai/reco.py
from collections import defaultdict
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
