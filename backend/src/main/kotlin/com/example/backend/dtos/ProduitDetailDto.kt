package com.example.backend.dtos

import lombok.Data
import java.math.BigDecimal
import java.time.LocalDateTime

data class ProduitRequestDto(
  val ean13: String?,
  val codebarre: String?,
  val codeLaborex: String?,
  val codeUbipharm: String?,
  val reference: String?,
  val nom: String?,
  val stock: Int?,
  val stockMax: Int?,
  val stockMin: Int?,
  val contenuDetail: String?,
  val prixDetail: Int?,
  val margeBeneficiaire: BigDecimal?,
  val tva: BigDecimal?,
  val etat: String?,
  val prixAchat: BigDecimal?,
  val prixVente: BigDecimal?,
  val reductionMax: Int?,
  val grossisteId: String?,
  val detailId: Int?,
  val categorie: Int?,
  val fournisseur: Int?,
  val forme: Int?,
  val fabriquant: Int?,
  val rayon: Int?,
  val etagere: String?,
  val magasin: Int?,
)

data class ProduitRequestNewDto(
  val id: Int?,
  val ean13: String?,
  val codebarre: String?,
  val codeLaborex: String?,
  val codeUbipharm: String?,
  val reference: String?,
  val nom: String?,
  val stock: Int?,
  val stockMax: Int?,
  val stockMin: Int?,
  val contenuDetail: String?,
  val prixDetail: String?,
  val produitDetail: String?,
  val etat: String?,
  val reductionMax: Int?,
  val detailId: Int?,
  val categorieId: Int?,
  val formeId: Int?,
  val fabriquantId: Int?,
  val rayonId: Int?,
  val etagere: String?,
  val magasinId: Int?,
)

data class ProduitResponseDto(
  var id: Int?,
  var nom: String,
  var description: String?,
  var codebarre: String?,
  var image: String?,
  var seuil: Int?,
  var categorieNom: String?,
  var uniteMesure: String?,
  var tva: BigDecimal?,
  var prixAchatInitial: BigDecimal?,
  var margeBeneficiaire: BigDecimal?,
  var prixVenteConseille: BigDecimal?,
  var prixVenteActuel: BigDecimal?,
  var quantiteTotaleEnStock: Int?,
  var dateCreation: LocalDateTime?,
  var dateModification: LocalDateTime?,
  var stockDetails: List<StockDetailDto>?
)

data class StockDetailDto(
  val enRayonId: Long?,
  val productNom: String?,
  val depotNom: String?,
  val rayonNom: String?,
  val quantite: Int,
  val datePeremption: LocalDateTime?,
  val numeroLot: String?
)

data class ProduitStockUpdateRequestDto(
  val quantiteChange: Int, // Positive for adding stock, negative for removing
  val depotId: Int,
  val rayonId: Int?,
  val numeroLot: String?, // Important for tracking specific batches
  val datePeremption: LocalDateTime? // For new stock entries
)

data class ProduitTarificationUpdateRequestDto(
  val nouveauPrixVente: BigDecimal,
  val dateDebut: LocalDateTime? // Defaults to now if null
)

// DTOs for Categorie and Fournisseur (simple for now)
data class CategorieDto(val id: Int?, val nom: String)
data class FournisseurDto(val id: Int?, val nom: String, val email: String?, val telephone: String?)
data class DepotDto(val id: Int?, val nom: String, val adresse: String?)
data class RayonDto(val id: Int?, val nom: String?, val code: String?)


data class ProduitDetailDto (
  val nom: String? = null,
  val reference: String? = null,
  val stock:Int? = 0,
  val stockMax:Int? = 0,
  val stockMin:Int? = 0,
  val prix: String? = null,
  val reductionMax:Int? = 0,
  val magasinId: Long? = null,
  val data: List<DataDto>? = null,
)

data class DataDto (
  val nom: String? = null,
  val contenuDetail: String? = null,
  val produitId: Long? = null
)
