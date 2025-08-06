package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.repositories.*
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class DashboardService(
  private val depenseRepository: DepenseRepository,
  private val caisseRepository: CaisseRepository,
  private val concernerRepository: ConcernerRepository,
  private val commandeRepository: CommandeRepository,
  private val retourProduitRepository: RetourProduitRepository,
  private val produitVenduRepository: ProduitVenduRepository,
  private val enRayonRepository: EnRayonRepository,
  private val venteRepository: VenteRepository,
) {

  fun kpis(from: LocalDateTime, to: LocalDateTime): KpiDto {
    val ca         = venteRepository.kpiCa(from, to)
    val encaisse   = venteRepository.kpiEncaisse(from, to)
    val tickets    = venteRepository.kpiTickets(from, to)
    val tauxRetour = retourProduitRepository.kpiTauxRetour(from, to) ?: 0.0
    val depenses   = depenseRepository.kpiDepenses(from, to)
    val sessions   = SessionsDto(caisseRepository.sessionsOuvertes(), caisseRepository.sessionsCloturees())
    val alerts     = AlertsDto(
      ruptures   = enRayonRepository.alertsRuptures(low = 10),
      perimes30j = enRayonRepository.alertsPerimes(days = 30)
    )

    // Option: sparkline brute = somme par mois -> extrait uniquement les valeurs
    val series = venteRepository.salesMonthly(from, to).map { it.getTotal() }

    return KpiDto(
      ca = ca, encaisse = encaisse, tickets = tickets,
      tauxRetour = tauxRetour, depenses = depenses,
      sessions = sessions, alerts = alerts, caSeries = series
    )
  }

  fun salesMonthly(from: LocalDateTime, to: LocalDateTime): List<SalesMonthlyPoint> =
    venteRepository.salesMonthly(from, to).map { SalesMonthlyPoint(it.getMois(), it.getTotal()) }

  fun salesByCategory(from: LocalDateTime, to: LocalDateTime): List<CategorySales> =
    concernerRepository.salesByCategory(from, to).map { CategorySales(it.getCategorie() ?: "Sans catégorie", it.getTotal()) }

  fun topProducts(limit: Int, from: LocalDateTime, to: LocalDateTime): List<TopProduct> =
    concernerRepository.topProducts(limit, from, to).map { TopProduct(it.getNom(), it.getQty()) }

  fun ordersRecent(page: Int, size: Int): List<OrderRow> {
    val offset = page * size
    return commandeRepository.ordersRecent(size, offset).map {
      OrderRow(
        id = it.getId(), ref = it.getRef(), fournisseur = it.getFournisseur(),
        montantCmd = it.getMontantCmd(), montantRecu = it.getMontantRecu(),
        etat = it.getEtat(), dateCreation = it.getDateCreation(), dateLivraison = it.getDateLivraison()
      )
    }
  }

  fun stockAlerts(low: Int, days: Int, limit: Int): List<StockAlertRow> =
    enRayonRepository.stockAlerts(low, days, limit).map {
      StockAlertRow(it.getProduit(), it.getQuantiteRestante(), it.getDatePeremption())
    }
}
