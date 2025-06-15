package com.example.backend.dtos

import com.fasterxml.jackson.annotation.JsonFormat
import java.math.BigDecimal
import java.time.LocalDate
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
  val productId: Long?,
  val productCmdId: Long?,
  val id: Long?,
  val nom: String?,
  val quantite: Int?,
  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  val datePeremption: LocalDateTime?,
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
