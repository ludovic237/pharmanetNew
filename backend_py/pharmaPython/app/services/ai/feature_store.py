from datetime import date, timedelta
from typing import List, Dict, Any, Tuple, Optional

from sqlalchemy import literal, select
from sqlalchemy.orm import Session

from app.models.produit import Produit
# Adapte les imports à tes repos existants
from app.repositories.vente_repository import VenteRepository
from app.repositories.produit_repository import ProduitRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.concerner_repository import ConcernerRepository

def get_daily_sales_series(db: Session, produit_id: int, days: int = 180) -> List[Tuple[date, float]]:
  """
  Retourne [(date, qty_vendue)] par jour pour un produit sur 'days' derniers jours.
  Utilise Vente + Concerner pour agréger les quantités.
  """
  # Idée: réutiliser une méthode existante si tu as déjà un "sales_daily(produit_id, from_date)"
  from_dt = date.today() - timedelta(days=days)
  # Exemples de récupération (à remplacer par tes méthodes repos)
  if produit_id>0:
    rows = ConcernerRepository(db).sum_daily_qty_by_product(produit_id, from_dt)
    return [(r["date"], float(r["qty"])) for r in rows]
  # rows -> [{"date": date, "qty": float}, ...]
  rows = ConcernerRepository(db).sum_daily_qty(from_dt)
  return [(r["date"], float(r["qty"])) for r in rows]

def get_current_stock(db: Session, produit_id: int) -> float:
  er = EnRayonRepository(db).sum_stock_by_product(produit_id)  # À adapter (somme des stock en rayons)
  return float(er or 0.0)

def get_products_basic(db: Session, limit: int = 1000) -> List[Dict[str, Any]]:
  rows = ProduitRepository(db).find_all_basic(limit=limit)  # À créer si besoin: id, nom
  return [{"id": r.id, "nom": r.nom} for r in rows]

def get_stock_bounds_map(db, product_ids):
  """
  Renvoie toujours un dict { produit_id: {"min": float|None, "max": float|None} }.
  Tolère l'absence des colonnes stock_min/stock_max.
  """
  try:
    if not product_ids:
      return {}

    # Construire un SELECT qui ne casse pas si les colonnes n'existent pas
    cols = [Produit.id]
    if hasattr(Produit, "stock_min"):
      cols.append(Produit.stock_min.label("stock_min"))
    else:
      cols.append(literal(None).label("stock_min"))

    if hasattr(Produit, "stock_max"):
      cols.append(Produit.stock_max.label("stock_max"))
    else:
      cols.append(literal(None).label("stock_max"))

    stmt = (
      select(*cols)
      .where(Produit.id.in_(list(product_ids)))
    )
    rows = db.execute(stmt).all()

    bounds = {}
    for r in rows:
      # r = (id, stock_min, stock_max)
      pid = r[0]
      stock_min = r[1] if len(r) > 1 else None
      stock_max = r[2] if len(r) > 2 else None

      # cast prudents
      try:
        stock_min = float(stock_min) if stock_min is not None else None
      except:
        stock_min = None
      try:
        stock_max = float(stock_max) if stock_max is not None else None
      except:
        stock_max = None

      bounds[pid] = {"min": stock_min, "max": stock_max}

    return bounds
  except Exception:
    # En cas d’erreur inattendue, on renvoie un dict vide plutôt que None
    return {}
