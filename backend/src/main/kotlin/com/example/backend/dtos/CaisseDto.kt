package com.example.backend.dtos

import java.math.BigDecimal
import java.time.LocalDateTime

data class CaisseOuvertureRequestDto(
  val fondCaisseOuvert: BigDecimal,
  val ouvertureCaisse: String
)

data class CaisseDto(
  val id: Int?,
  val employeId: Int?,
  val employeNom: String?, // Pour affichage
  val dateOuvert: LocalDateTime?,
  val dateFerme: LocalDateTime?,
  val session: String?,
  val fondCaisseOuvert: BigDecimal?,
  val fondCaisseFerme: BigDecimal?,
  val etat: String?
)

data class CaisseClotureRequestDto(
  val fondCaisseFerme: Int,
  val fermetureCaisse: String
)

data class CaisseFermetureRequestDto(
  val fondCaisseFerme: BigDecimal,
  // Ajoutez d'autres champs si nécessaire pour la clôture, ex: totalVentesEspeces, totalDepenses
)
