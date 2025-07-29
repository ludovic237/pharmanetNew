package com.example.backend.dtos

import org.bouncycastle.util.test.FixedSecureRandom.BigInteger
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ProduitAssocieDto(
  val produitId: Long?,
  val quantite: Int?,
  val rayonId: String?,
  val type: String?,
  val prixUnit: Int?,
  val reduction: Int? // Modifiable unit price
)

data class VenteRequestDto(
  val reduction: Int?,
  val clientInfo: ClientInfo,
  val prescripteurInfo: PrescripteurInfo,
  val reductionEnabled: Boolean,
  val prixTotal: Double,
  val prixReduction: Double,
  val commentaire: String,
  val etat: String, // State of the sale: "COMPTANT", "ASSURANCE", or "CREDIT"
  val produits: List<ProduitAssocieDto> // List of associated products with quantity and price
)

data class ClientInfo(
  val id: Int?,
  val type: String?,
  val name: String?,
  val phone: String?,
)

data class PrescripteurInfo(
  val id: Int?,
  val type: String?,
  val name: String?,
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

data class EncaissementDto(
  var typeEncaissement: String,
  val venteId: Long,
  val montantPercu: Int,
  val montantRendu: Int,

  val espece: Int?, // Cash payment amount
  val electronique: ElectroniqueDto?, // Electronic payment details
  val ticket: TicketDto? // Ticket payment amount
)

data class EncaissementDirectDto(
  var encaissementDto: EncaissementDto,
  val venteRequestDto: VenteRequestDto,
)

data class ElectroniqueDto(
  val numeroTelephone: String,
  val montantElectronique: Int
)

data class TicketDto(
  val numeroTicket: String,
  val montantTicket: Int
)
