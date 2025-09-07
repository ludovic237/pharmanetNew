from datetime import date, timedelta
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

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
  rows = ConcernerRepository(db).sum_daily_qty_by_product(produit_id, from_dt)
  # rows -> [{"date": date, "qty": float}, ...]
  return [(r["date"], float(r["qty"])) for r in rows]

def get_current_stock(db: Session, produit_id: int) -> float:
  er = EnRayonRepository(db).sum_stock_by_product(produit_id)  # À adapter (somme des stock en rayons)
  return float(er or 0.0)

def get_products_basic(db: Session, limit: int = 1000) -> List[Dict[str, Any]]:
  rows = ProduitRepository(db).find_all_basic(limit=limit)  # À créer si besoin: id, nom
  return [{"id": r.id, "nom": r.nom} for r in rows]
