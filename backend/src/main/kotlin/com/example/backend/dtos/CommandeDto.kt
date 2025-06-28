package com.example.backend.dtos

import com.fasterxml.jackson.annotation.JsonFormat
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
  var productId: Long?,
  var productCmdId: Long?,
  val id: Long?,
  val nom: String?,
  val quantite: Int?=0,
  val quantiteRecu: Int?=0,
  val uniteGratuite: Int?=0,
  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  val dateDePeremption: LocalDateTime?,
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
