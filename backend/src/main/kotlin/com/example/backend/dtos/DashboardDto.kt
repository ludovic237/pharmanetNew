package com.example.backend.dtos

import java.time.LocalDate
import java.time.LocalDateTime

data class KpiDto(
  val ca: Double,
  val encaisse: Double,
  val tickets: Long,
  val tauxRetour: Double,
  val depenses: Double,
  val sessions: SessionsDto,
  val alerts: AlertsDto,
  val caSeries: List<Double> = emptyList()
)

data class SessionsDto(
  val ouvertes: Long,
  val cloturees: Long
)

data class AlertsDto(
  val ruptures: Long,
  val perimes30j: Long
)

data class SalesMonthlyPoint(
  val mois: String,          // "YYYY-MM"
  val total: Double
)

data class CategorySales(
  val categorie: String,
  val total: Double
)

data class TopProduct(
  val nom: String,
  val qty: Long
)

data class OrderRow(
  val id: Long,
  val ref: String?,
  val fournisseur: String?,
  val montantCmd: Double?,
  val montantRecu: Double?,
  val etat: String?,
  val dateCreation: LocalDateTime?,
  val dateLivraison: LocalDateTime?
)

data class StockAlertRow(
  val produit: String,
  val quantiteRestante: Int?,
  val datePeremption: LocalDate?
)


interface CategorySalesRow { fun getCategorie(): String?; fun getTotal(): Double }

interface TopProductRow { fun getNom(): String; fun getQty(): Long }

// === Tables ===
interface OrderRowView {
  fun getId(): Long
  fun getRef(): String?
  fun getFournisseur(): String?
  fun getMontantCmd(): Double?
  fun getMontantRecu(): Double?
  fun getEtat(): String?
  fun getDateCreation(): LocalDateTime?
  fun getDateLivraison(): LocalDateTime?
}

interface StockAlertRowView {
  fun getProduit(): String
  fun getQuantiteRestante(): Int?
  fun getDatePeremption(): LocalDate?
}
