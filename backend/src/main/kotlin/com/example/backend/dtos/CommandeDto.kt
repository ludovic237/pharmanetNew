package com.example.backend.dtos

import com.fasterxml.jackson.annotation.JsonFormat
import org.springframework.data.domain.Page
import java.time.LocalDateTime

data class CommandeDTO(
  val id: Long?,
  val dateCreation: String?,
  val dateLivraison: String?,
  val fournisseurId: Long?,
  val produits: List<ProduitCommandeDTO>,
  val montantTotal: Double?,
  val etat: String?,
  val note: String?
)

data class CommandeNewDTO(
  val id: Int?,
  val nom: String?,
  val prix: Int?,
  val stock: Int?,
  val fournisseur: String?,
  val dateLivraison: String?,
  val datePeremption: String?,
  val quantiteStock: Int?,
  val prixAchat: Int?,
  val quantiteRestante: Int?,
)

data class ProduitCommandeDTO(
  val produitId: Long,
  val quantite: Int,
  val prixUnitaire: Double
)

data class CommandeRequest(
  val clientId: Long,
  val type: String,
  val employeId: Long,
  val fournisseurId: Long,
  val produits: List<ProduitCmdRequest>
)


data class ProduitCmdRequest(
  var codebarre: String?,
  var productId: Long?,
  var productCmdId: Long?,
  val id: Long?,
  val nom: String?,
  val quantite: Int? = 0,
  val quantiteRecu: Int? = 0,
  val uniteGratuite: Int? = 0,
//  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  val dateDePeremption: String?,
  val prixUnitaire: Double?,
  val prixVente: Double?,
  val prixAchat: Double?,
)

data class Produit(
  val id: Long?,
  val nom: String,
  val quantite: Int,
  val prixUnitaire: Double
)


data class CommandePageableCustomlDto(
  var content: Page<Map<String, Any?>?>?,
  var totalElements: Long?,
  var totalPages: Int?,
  var pageSize: Int?,
  var pageNumber: Int?,
  var totalAmountRecu: Double?,
  var totalAmountCommande: Double?,
  var totalQteRecu: Int?,
  var totalQteCommande: Int?,
)
