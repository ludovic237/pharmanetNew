package com.example.backend.dtos

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
