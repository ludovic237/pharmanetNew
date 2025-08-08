package com.example.backend.dtos

import java.math.BigDecimal
import java.time.LocalDateTime


data class TypeSortieDto(
  val id: Int?=0,
  val nom: String?="",
  val description: String?=""
)
