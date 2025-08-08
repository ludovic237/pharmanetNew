package com.example.backend.dtos

import java.math.BigDecimal
import java.time.LocalDateTime


data class SortieDetailDto(
  val enrayon: List<Enrayon>?,
  val produitDetailId: Int?,
  val typeSortieId: Int?,
)

data class Enrayon(
  val contenuDetail: String?,
  val id: Int?,
  val quantite: Int?,
  val rayonId: String?,
  val stockTotal: Int?
)
