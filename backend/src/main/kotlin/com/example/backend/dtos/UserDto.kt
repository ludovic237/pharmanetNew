package com.example.backend.dtos

import org.bouncycastle.util.test.FixedSecureRandom.BigInteger
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class UserNewDto(
  val nom: String?,
  val prenom: String?,
  val email: String?,
  val fonction: String?,
  val reduction: String?,
  val telephone: String?,
  val reductionMax: String?,
  val reductionFait: String?,
  val id: String?
)
