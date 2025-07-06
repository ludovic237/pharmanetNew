package com.example.backend.repositories;

import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.Produit
import com.example.backend.models.Rayon
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.time.LocalDateTime
import java.util.*

interface EnRayonRepository : JpaRepository<EnRayon, Int>, JpaSpecificationExecutor<EnRayon> {
  fun findByProduitAndRayonAndSupprimer(
    produit: Produit,
    rayon: Rayon?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findByProduitAndCommandeAndSupprimer(
    produit: Produit,
    commande: Commande?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findByProduitAndSupprimer(
    produit: Produit,
    supprimer: Int = 0
  ): List<EnRayon>

  fun findAllByProduitAndSupprimer(produit: Produit, supprimer: Int = 0): List<EnRayon>
  fun findAllByRayon(rayon: EnRayon): EnRayon

  fun findByProduitNomContainingIgnoreCaseAndSupprimer(nomProduit: String, supprimer: Int): List<EnRayon>
  fun findByRayonNomContainingIgnoreCaseAndSupprimer(nomRayon: String, supprimer: Int): List<EnRayon>
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
  }
}
