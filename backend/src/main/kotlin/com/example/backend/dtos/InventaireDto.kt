package com.example.backend.dtos


data class ProduitInventaireDto(
  val produitId: Long,
  val rayonId: Long,
  val quantiteReel: Int,
  val quantiteSysteme: Int,
)

data class InventaireRequestDto(
  val dateDeDebut: String,
  val produitList: List<ProduitInventaireDto>,
)

data class InventaireUpdateRequestDto(
  val id: String,
  val produitList: List<ProduitInventaireDto>,
)
