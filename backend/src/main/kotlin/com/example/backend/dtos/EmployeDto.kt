package com.example.backend.dtos


data class EmployeNewDto(
  val codebarreId: String?,
  val etat: String?,
  val faireReductionMax: String?,
  val id: Int?,
  val identifiant: String?,
  val images: String?,
  val password: String?,
  val type: String?, // Modifiable unit price
  val user: String? // Modifiable unit price
)

