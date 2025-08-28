from datetime import datetime
from sqlalchemy.orm import Session
from typing import List

from app.schemas.dashboard_dto import SessionsDto, AlertsDto, KpiDto, CategorySales, SalesMonthlyPoint, TopProduct, \
  OrderRow, StockAlertRow


class DashboardService:
  def __init__(self, db: Session,
               depense_repo,
               caisse_repo,
               concerner_repo,
               commande_repo,
               retour_repo,
               produit_vendu_repo,
               enrayon_repo,
               vente_repo):
    self.db = db
    self.depense_repo = depense_repo
    self.caisse_repo = caisse_repo
    self.concerner_repo = concerner_repo
    self.commande_repo = commande_repo
    self.retour_repo = retour_repo
    self.produit_vendu_repo = produit_vendu_repo
    self.enrayon_repo = enrayon_repo
    self.vente_repo = vente_repo

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
    series = [row.total for row in self.vente_repo.sales_monthly(from_dt, to_dt)]

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
    return [SalesMonthlyPoint(mois=row.mois, total=row.total) for row in rows]

  # ----------------------------
  # Ventes par catégorie
  # ----------------------------
  def get_sales_by_category(self, from_dt: datetime, to_dt: datetime) -> List[CategorySales]:
    rows = self.concerner_repo.sales_by_category(from_dt, to_dt)
    return [
      CategorySales(categorie=row.categorie or "Sans catégorie", total=row.total)
      for row in rows
    ]

  # ----------------------------
  # Produits les plus vendus
  # ----------------------------
  def get_top_products(self, limit: int, from_dt: datetime, to_dt: datetime) -> List[TopProduct]:
    rows = self.concerner_repo.top_products(limit, from_dt, to_dt)
    return [TopProduct(nom=row.nom, qty=row.qty) for row in rows]

  # ----------------------------
  # Commandes récentes
  # ----------------------------
  def get_orders_recent(self, page: int, size: int) -> List[OrderRow]:
    offset = page * size
    rows = self.commande_repo.orders_recent(size, offset)
    return [
      OrderRow(
        id=row.id,
        ref=row.ref,
        fournisseur=row.fournisseur,
        montantCmd=row.montantCmd,
        montantRecu=row.montantRecu,
        etat=row.etat,
        dateCreation=row.dateCreation,
        dateLivraison=row.dateLivraison
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
        produit=row.produit,
        quantiteRestante=row.quantiteRestante,
        datePeremption=row.datePeremption
      )
      for row in rows
    ]
