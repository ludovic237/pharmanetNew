package com.example.backend.dtos

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ProduitAssocieDto(
  val produitId: Long,
  val quantite: Int,
  val prixUnit: Int // Modifiable unit price
)

data class VenteRequestDto(
  val prixTotal: Double,
  val commentaire: String,
  val etat: String, // State of the sale: "COMPTANT", "ASSURANCE", or "CREDIT"
  val produits: List<ProduitAssocieDto> // List of associated products with quantity and price
)

data class EncaissementRequestDto(
    val typePaiement: String,
    val montantPercu: Int,
    val reste: Int,
    val montantTtc: Int,
    val espece: Int?, // Cash payment amount
    val electronique: ElectroniqueRequestDto?, // Electronic payment details
    val ticket: Int? // Ticket payment amount
)

data class ElectroniqueRequestDto(
    val numeroTelephone: String,
    val montant: Int
)

