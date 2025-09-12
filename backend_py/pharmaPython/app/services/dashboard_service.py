from datetime import datetime
from sqlalchemy.orm import Session
from typing import List

from app.repositories.caisse_repository import CaisseRepository
from app.repositories.commande_repository import CommandeRepository
from app.repositories.concerner_repository import ConcernerRepository
from app.repositories.depense_repository import DepenseRepository
from app.repositories.en_rayon_repository import EnRayonRepository
from app.repositories.produit_vendu_repository import ProduitVenduRepository
from app.repositories.retour_produit_repository import RetourProduitRepository
from app.repositories.vente_repository import VenteRepository
from app.schemas.dashboard_dto import SessionsDto, AlertsDto, KpiDto, CategorySales, SalesMonthlyPoint, TopProduct, \
  OrderRow, StockAlertRow


class DashboardService:
  def __init__(self, db: Session):
    self.db = db
    self.depense_repo = DepenseRepository(db)
    self.caisse_repo = CaisseRepository(db)
    self.concerner_repo = ConcernerRepository(db)
    self.commande_repo = CommandeRepository(db)
    self.retour_repo = RetourProduitRepository(db)
    self.produit_vendu_repo = ProduitVenduRepository(db)
    self.enrayon_repo = EnRayonRepository(db)
    self.vente_repo = VenteRepository(db)

  # ----------------------------
  # KPIs principaux
  # ----------------------------
  def get_kpis(self, from_dt: datetime, to_dt: datetime) -> KpiDto:
    ca = self.vente_repo.kpi_ca(from_dt, to_dt)
    encaisse = self.vente_repo.kpi_encaisse(from_dt, to_dt)
    tickets = self.vente_repo.kpi_tickets(from_dt, to_dt)
    taux_retour = self.retour_repo.kpi_taux_retour(from_dt, to_dt) or 0.0
    depenses = self.depense_repo.kpi_depenses(from_dt, to_dt)

    sessions = SessionsDto(
      ouvertes=self.caisse_repo.sessions_ouvertes(),
      cloturees=self.caisse_repo.sessions_cloturees()
    )
    alerts = AlertsDto(
      ruptures=self.enrayon_repo.alerts_ruptures(low=10),
      perimes30j=self.enrayon_repo.alerts_perimes(days=30)
    )

    # Sparkline brute : série de CA par mois
    series = [row["total"] for row in self.vente_repo.sales_monthly(from_dt, to_dt)]

    return KpiDto(
      ca=ca,
      encaisse=encaisse,
      tickets=tickets,
      tauxRetour=taux_retour,
      depenses=depenses,
      sessions=sessions,
      alerts=alerts,
      caSeries=series
    )

  # ----------------------------
  # Ventes mensuelles
  # ----------------------------
  def get_sales_monthly(self, from_dt: datetime, to_dt: datetime) -> List[SalesMonthlyPoint]:
    rows = self.vente_repo.sales_monthly(from_dt, to_dt)
    print("get_sales_monthly")
    print(rows)
    return [SalesMonthlyPoint(mois=row["mois"], total=row["total"]) for row in rows]

  # ----------------------------
  # Ventes par catégorie
  # ----------------------------
  def get_sales_by_category(self, from_dt: datetime, to_dt: datetime) -> List[CategorySales]:
    rows = self.concerner_repo.sales_by_category(from_dt, to_dt)
    print("get_sales_by_category")
    print(rows)
    return [
      CategorySales(categorie=(row["categorie"] or "Sans catégorie"), total=row["total"])
      for row in rows
    ]

  # ----------------------------
  # Produits les plus vendus
  # ----------------------------
  def get_top_products(self, limit: int, from_dt: datetime, to_dt: datetime) -> List[TopProduct]:
    rows = self.concerner_repo.top_products(limit, from_dt, to_dt)
    interval = from_dt - to_dt
    new_from = from_dt - interval
    new_to = to_dt - interval
    # most_sell = self.concerner_repo.total_qty_by_product_between(rows[0].get("id"), new_from, new_to)
    return [TopProduct(
      id=row["id"],
      nom=row["nom"],
      score=((row["qty"] / rows[0]["qty"]) * 100),
      variation=self.calcul_variation(row["qty"],
                                      self.concerner_repo.total_qty_by_product_between(row["id"], new_from, new_to)),
      qty=row["qty"]
    ) for row in rows]

  def calcul_variation(self, current_sales: int, previous_sales: int):
    if previous_sales == 0:
      if current_sales == 0:
        return "0%"
      else:
        return "100%"
    varition = ((current_sales - previous_sales) / previous_sales) * 100
    return f"{varition:.2f}%"

  # ----------------------------
  # Commandes récentes
  # ----------------------------
  def get_orders_recent(self, page: int, size: int) -> List[OrderRow]:
    offset = page * size
    rows = self.commande_repo.orders_recent(size, offset)
    return [
      OrderRow(
        id=row["id"],
        ref=row["ref"],
        fournisseur=row["fournisseur"],
        montantCmd=row["montantCmd"],
        montantRecu=row["montantRecu"],
        etat=row["etat"],
        dateCreation=row["dateCreation"],
        dateLivraison=row["dateLivraison"]
      )
      for row in rows
    ]

  # ----------------------------
  # Alertes stock
  # ----------------------------
  def get_stock_alerts(self, low: int, days: int, limit: int) -> List[StockAlertRow]:
    rows = self.enrayon_repo.stock_alerts(low, days, limit)
    return [
      StockAlertRow(
        produitId=row["produitId"],
        produit=row["produit"],
        quantiteRestante=row["quantiteRestante"],
        datePeremption=row["datePeremption"]
      )
      for row in rows
    ]
