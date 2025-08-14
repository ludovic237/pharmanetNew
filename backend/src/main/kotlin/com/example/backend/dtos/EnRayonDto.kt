package com.example.backend.dtos

import org.springframework.data.domain.Page
import java.time.LocalDateTime

data class ProduitEnRayonDto(
    val enRayonId: Long? = null, // Optional for adding new products
    val produitId: Long,
    val fournisseurId: Long?,
    val rayonId: Long?,
    val quantite: Int,
    val quantiteRestante: Int,
    val reduction: Int,
    val prixVente: Int? = null,
    val prixAchat: Int? = null,
    val datePeremption: LocalDateTime?=LocalDateTime.now(),
    val dateLivraison: LocalDateTime?=LocalDateTime.now()
)
data class ProduitDetailIncrementEnRayonDto(
    val enRayonId: String? = null,
    val produitDetailId: String? = null,
)

data class EnRayonDto (
   val enRayonId:String? = null,
   val prixAchat:Int? = 0,
   val prixVente :Int? = 0,
   val reductionMax :Int? = 0,
   val quantiteRestante :Int? = 0,
   val datePeremption: String? = null // Getters and Setters
)

data class EnRayonPageableCustomDto(
  var content: Page<Map<String, Any?>?>,
  var totalElements: Long?,
  var totalPages: Int?,
  var pageSize: Int?,
  var pageNumber: Int?,
  var totalAmountEnRayon: Double?,
  var totalQte: Int?,
)
