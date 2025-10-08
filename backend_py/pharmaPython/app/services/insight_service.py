# app/services/insight_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta, datetime
import pandas as pd

from app.models.en_rayon import EnRayon
from app.models.vente import Vente
from app.models.concerner import Concerner
from app.models.produit import Produit
from app.models.categorie import Categorie


def kpis(db: Session, days: int = 30):
  since = date.today() - timedelta(days=days)
  ca, nb_ventes = (
    db.query(func.coalesce(func.sum(Vente.prix_total), 0.0),
             func.count(Vente.id))
    .filter(Vente.date_vente >= since)
    .one()
  )
  panier_moyen = (float(ca) / max(1, nb_ventes))
  return dict(ca=ca, nb_ventes=nb_ventes, panier_moyen=panier_moyen)

  # def sales_by_category(db: Session, days: int = 30):


def sales_by_category(db: Session,
                      from_dt: datetime = datetime.now(),
                      to_dt: datetime = datetime.now().replace(day=1)):
  since = to_dt - from_dt
  rows = (
    db.query(Categorie.nom, func.sum(Concerner.quantite * Concerner.prix_unit))
    .join(Produit, Produit.categorie_id == Categorie.id)
    .join(EnRayon, EnRayon.produit_id == Produit.id)
    .join(Concerner, Concerner.en_rayon_id == EnRayon.id)
    .join(Vente, Vente.id == Concerner.vente_id)
    .filter(Vente.date_vente >= since)
    .group_by(Categorie.nom)
    .order_by(func.sum(Concerner.quantite * Concerner.prix_unit).desc())
    .all()
  )
  # rows = (
  #   db.query(Produit)
  #   .all()
  # )
  return [{"categorie": n, "ca": float(ca or 0)} for n, ca in rows]


# def weekly_seasonality(db: Session, weeks: int = 8):
#   since = date.today() - timedelta(days=7*weeks)
#   rows = (
#     db.query(extract("dow", Vente.date_vente), func.sum(Vente.prix_total))
#     .filter(Vente.date_vente >= since)
#     .group_by(extract("dow", Vente.date_vente))
#     .order_by(extract("dow", Vente.date_vente))
#     .all()
#   )
#   # dow: 0=Dimanche … 6=Samedi (selon moteur)
#   return [{"dow": int(dow), "ca": float(ca or 0)} for dow, ca in rows]

def weekly_seasonality(db, weeks: int = 8):
  since = date.today() - timedelta(weeks=weeks)

  # WEEKDAY: 0=Lun ... 6=Dim
  dow_expr = func.weekday(Vente.date_vente).label("dow")

  rows = (
    db.query(
      dow_expr,
      func.sum(Vente.prix_total).label("total"),
    )
    .filter(Vente.date_vente >= since)
    .group_by(dow_expr)
    .order_by(dow_expr)
    .all()
  )

  dow_labels = {
    0: "Lundi", 1: "Mardi", 2: "Mercredi", 3: "Jeudi",
    4: "Vendredi", 5: "Samedi", 6: "Dimanche",
  }

  return [
    {
      "dow": int(r.dow),
      "label": dow_labels.get(int(r.dow), str(r.dow)),
      "total": float(r.total or 0),
    }
    for r in rows
  ]


def basket_pairs(db: Session, days: int = 30, min_support: int = 10):
  """
  Co-occurrence simple produit-produit (pairs) pour suggérer cross-sell.
  """
  since = date.today() - timedelta(days=days)
  # Récupère ventes et leurs produits
  rows = (
    db.query(Concerner.vente_id, Concerner.produit_id)
    .join(Vente, Vente.id == Concerner.vente_id)
    .filter(Vente.date_vente >= since)
    .all()
  )
  if not rows:
    return []
  df = pd.DataFrame(rows, columns=["vente_id", "produit_id"]).drop_duplicates()
  pairs = (df.merge(df, on="vente_id")
           .query("produit_id_x < produit_id_y")
           .groupby(["produit_id_x", "produit_id_y"])
           .size()
           .reset_index(name="support"))
  pairs = pairs[pairs["support"] >= min_support].sort_values("support", ascending=False)
  return pairs.to_dict(orient="records")


def sales_monthly(db, since: date, until: date):
  m = func.month(Vente.date_vente).label("month")
  y = func.year(Vente.date_vente).label("year")
  rows = (
    db.query(y, m, func.sum(Vente.prix_total).label("total"))
    .filter(Vente.date_vente >= since, Vente.date_vente <= until)
    .group_by(y, m)
    .order_by(y, m)
    .all()
  )
  return [{"year": int(r.year), "month": int(r.month), "total": float(r.total or 0)} for r in rows]



def sales_daily_all(db, since: date, until: date):
  m = func.month(Vente.date_vente).label("month")
  y = func.year(Vente.date_vente).label("year")
  rows = (
    db.query(y, m, func.sum(Vente.prix_total).label("total"))
    .filter(Vente.date_vente >= since, Vente.date_vente <= until)
    .group_by(y, m)
    .order_by(y, m)
    .all()
  )
  return [{"year": int(r.year), "month": int(r.month), "total": float(r.total or 0)} for r in rows]
