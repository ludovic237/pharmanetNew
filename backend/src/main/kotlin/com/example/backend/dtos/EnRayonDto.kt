package com.example.backend.dtos

import java.math.BigDecimal
import java.time.LocalDate
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
