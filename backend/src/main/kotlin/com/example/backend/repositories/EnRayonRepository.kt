package com.example.backend.repositories;

import com.example.backend.dtos.StockAlertRowView
import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.Produit
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime
import java.util.*

interface EnRayonRepository : JpaRepository<EnRayon, String>, JpaSpecificationExecutor<EnRayon> {


  fun findByProduitIdAndCommandeAndSupprimer(
    produit: Int,
    commande: Commande?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findByProduitIdAndSupprimer(
    produit: Int,
    supprimer: Int = 0
  ): List<EnRayon>

  fun findByProduitIdAndQuantiteRestanteGreaterThanAndSupprimer(
    produit: Int,
    quantite: Int = 0,
    supprimer: Int = 0
  ): List<EnRayon>

  fun findByProduitIdAndIdAndSupprimer(
    produit: Int,
    rayonId: String,
    supprimer: Int = 0
  ): EnRayon

  fun findAllByProduitIdAndSupprimer(produit: Int, supprimer: Int = 0): List<EnRayon>
  fun findAllByProduitIdInAndSupprimer(produitIdList: List<Int?>, supprimer: Int = 0): List<EnRayon>
  fun findAllByProduitIdAndSupprimerAndQuantiteRestanteGreaterThan(
    produit: Int,
    supprimer: Int = 0,
    quantite: Int = 0
  ): List<EnRayon>
//  fun findAllByRayon(rayon: EnRayon): EnRayon

  fun findByProduitIdInAndSupprimer(nomProduit: List<Int>, supprimer: Int): List<EnRayon>

  //  fun findByRayonIdInAndSupprimer(nomRayon: List<Int>, supprimer: Int): List<EnRayon>
  fun findByFournisseurNomContainingIgnoreCaseAndSupprimer(nomFournisseur: String, supprimer: Int): List<EnRayon>

  //  fun findByProduitUniterContainingIgnoreCaseAndSupprimer(uniter: String, supprimer: Int): List<EnRayon>
  fun findByCommandeIdAndSupprimer(commandeId: Long, supprimer: Int): List<EnRayon>
  fun findByDateLivraisonBetweenAndSupprimer(
    startDate: LocalDateTime,
    endDate: LocalDateTime,
    supprimer: Int
  ): List<EnRayon>

  fun findByDatePeremptionBetweenAndSupprimer(
    startDate: LocalDateTime,
    endDate: LocalDateTime,
    supprimer: Int
  ): List<EnRayon>

  fun findByPrixAchatBetweenAndSupprimer(minPrix: Double, maxPrix: Double, supprimer: Int): List<EnRayon>
  fun findByPrixVenteBetweenAndSupprimer(minPrix: Double, maxPrix: Double, supprimer: Int): List<EnRayon>


  companion object {
    fun filterEnRayon(
      nomProduit: String?,
      bientotPerimee: Boolean?,
      joursAvantPeremption: Int?,
      enStock: Boolean?,
    ): Specification<EnRayon> {
      return Specification { root, query, criteriaBuilder ->
        val now = LocalDateTime.now()
        val predicates = mutableListOf<Predicate>()

        if (!nomProduit.isNullOrEmpty() && nomProduit != "null") {
          predicates.add(
            criteriaBuilder.like(
              criteriaBuilder.lower(root.get<String>("produit").get("nom")),
              "%${nomProduit}%"
            )
          )
        }

        bientotPerimee?.let {
          if (it is Boolean) {
            val dateThreshold = now.plusDays(7) // Example: 7 days threshold for "bientôt périmée"
            if (it) {
              predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), dateThreshold))
            } else {
              predicates.add(criteriaBuilder.greaterThan(root.get("datePeremption"), dateThreshold))
            }
          }
        }

        joursAvantPeremption?.let {
          if (it > 0) {
            val targetDate = now.plusDays(it.toLong())
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), targetDate))
          }
        }

        enStock?.let {
          if (it is Boolean) {
            if (it) {
              predicates.add(criteriaBuilder.greaterThan(root.get("quantiteRestante"), 0))
            } else {
              predicates.add(criteriaBuilder.equal(root.get<Int>("quantiteRestante"), 0))
            }
          }
        }
        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }

    fun filterEnRayonRange(
      nomProduit: String?,
      startDate: String?,
      endDate: String?,
      bientotPerimee: Boolean?,
      joursAvantPeremption: Int?,
      enStock: Boolean?,
    ): Specification<EnRayon> {
      return Specification { root, query, criteriaBuilder ->
        val now = LocalDateTime.now()
        val predicates = mutableListOf<Predicate>()

        if (!nomProduit.isNullOrEmpty() && nomProduit != "null") {
          predicates.add(
            criteriaBuilder.like(
              criteriaBuilder.lower(root.get<String>("produit").get("nom")),
              "%${nomProduit}%"
            )
          )
        }

        bientotPerimee?.let {
          if (it is Boolean) {
            val dateThreshold = now.plusDays(7) // Example: 7 days threshold for "bientôt périmée"
            if (it) {
              predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), dateThreshold))
            } else {
              predicates.add(criteriaBuilder.greaterThan(root.get("datePeremption"), dateThreshold))
            }
          }
        }

        joursAvantPeremption?.let {
          if (it > 0) {
            val targetDate = now.plusDays(it.toLong())
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), targetDate))
          }
        }

        enStock?.let {
          if (it is Boolean) {
            if (it) {
              predicates.add(criteriaBuilder.greaterThan(root.get("quantiteRestante"), 0))
            } else {
              predicates.add(criteriaBuilder.equal(root.get<Int>("quantiteRestante"), 0))
            }
          }
        }

        if (!startDate.isNullOrEmpty() && !startDate.trim().equals("null", ignoreCase = true)) {
          val startDateTime = LocalDateTime.parse(startDate.trim())
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get<LocalDateTime>("dateLivraison"), startDateTime))
        }

        if (!endDate.isNullOrEmpty() && !endDate.trim().equals("null", ignoreCase = true)) {
          val endDateTime = LocalDateTime.parse(endDate)
          predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get<LocalDateTime>("dateLivraison"), endDateTime))
        }
        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }

    fun filterEnRayonRangeWithProduitId(
      produitId: String?,
      supprimer: String?,
      startDate: String?,
      endDate: String?,
      bientotPerimee: Boolean?,
      joursAvantPeremption: Int?,
      enStock: Boolean?,
    ): Specification<EnRayon> {
      return Specification { root, query, criteriaBuilder ->
        val now = LocalDateTime.now()
        val predicates = mutableListOf<Predicate>()

        if (!produitId.isNullOrEmpty() && produitId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("produitId"), produitId))
        }

        if (!supprimer.isNullOrEmpty() && produitId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("supprimer"), supprimer))
        }


        bientotPerimee?.let {
          if (it is Boolean) {
            val dateThreshold = now.plusDays(7) // Example: 7 days threshold for "bientôt périmée"
            if (it) {
              predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), dateThreshold))
            } else {
              predicates.add(criteriaBuilder.greaterThan(root.get("datePeremption"), dateThreshold))
            }
          }
        }

        joursAvantPeremption?.let {
          if (it > 0) {
            val targetDate = now.plusDays(it.toLong())
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("datePeremption"), targetDate))
          }
        }

        enStock?.let {
          if (it is Boolean) {
            if (it) {
              predicates.add(criteriaBuilder.greaterThan(root.get("quantiteRestante"), 0))
            } else {
              predicates.add(criteriaBuilder.equal(root.get<Int>("quantiteRestante"), 0))
            }
          }
        }

        if (!startDate.isNullOrEmpty() && !startDate.trim().equals("null", ignoreCase = true)) {
          val startDateTime = LocalDateTime.parse(startDate.trim())
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get<LocalDateTime>("dateLivraison"), startDateTime))
        }

        if (!endDate.isNullOrEmpty() && !endDate.trim().equals("null", ignoreCase = true)) {
          val endDateTime = LocalDateTime.parse(endDate)
          predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get<LocalDateTime>("dateLivraison"), endDateTime))
        }
        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

  @Query(
    value = """
        SELECT p.nom AS produit, er.quantite_restante AS quantiteRestante, er.date_peremption AS datePeremption
        FROM en_rayon er
        JOIN produit p ON p.id = er.produit_id
        WHERE (er.quantite_restante IS NOT NULL AND er.quantite_restante <= :low)
           OR (er.date_peremption IS NOT NULL AND er.date_peremption <= DATE_ADD(CURDATE(), INTERVAL :days DAY))
        ORDER BY er.quantite_restante ASC, er.date_peremption ASC
        LIMIT :limit
        """,
    nativeQuery = true
  )
  fun stockAlerts(@Param("low") low: Int, @Param("days") days: Int, @Param("limit") limit: Int): List<StockAlertRowView>

  @Query(
    value = """
        SELECT COUNT(*)
        FROM en_rayon
        WHERE (quantite_restante IS NOT NULL AND quantite_restante <= :low)
        """,
    nativeQuery = true
  )
  fun alertsRuptures(@Param("low") low: Int): Long

  @Query(
    value = """
        SELECT COUNT(*)
        FROM en_rayon
        WHERE date_peremption IS NOT NULL
          AND date_peremption <= DATE_ADD(CURDATE(), INTERVAL :days DAY)
        """,
    nativeQuery = true
  )
  fun alertsPerimes(@Param("days") days: Int): Long


}
