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

data class InventaireNewCreatetDto(
  val rayonId: String?,
  val categorieId: String?,
  val fabriquantId: String?,
  val formeId: String?,
  val fournisseurId: String?,
)

data class InventaireUpdateRequestDto(
  val id: String,
  val produitList: List<ProduitInventaireDto>,
)

data class InventaireOneProductUpdateRequestDto(
  val id: String?,
  val produitId: Long?,
  val rayonId: Long?,
  val quantiteReel: Int?,
  val quantiteSysteme: Int?,
  val isValid: Boolean? = false,
)
