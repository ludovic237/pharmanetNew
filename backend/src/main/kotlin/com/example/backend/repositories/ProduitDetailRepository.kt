package com.example.backend.repositories;

import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.ProduitDetail
import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.time.LocalDateTime

interface ProduitDetailRepository : JpaRepository<ProduitDetail, Int>, JpaSpecificationExecutor<ProduitDetail> {
  fun findByNomContainingIgnoreCaseAndSupprimerIs(nom: String, supprimer: Int):List<ProduitDetail>

  fun findByNomContainingIgnoreCaseAndSupprimerIs(nom: String, supprimer: Int, pageable: Pageable): Page<ProduitDetail>

  fun findByNomContainsIgnoreCaseAndSupprimer(nom: String, supprimer: Int, pageable: Pageable): Page<ProduitDetail>

  fun findByNomContainingIgnoreCaseAndSupprimer(nom: String?, supprimer: Int, pageable: Pageable): Page<ProduitDetail>

  fun findByIdAndStockGreaterThanAndSupprimer(
    produit: Int,
    quantite: Int = 0,
    supprimer: Int = 0
  ): ProduitDetail

  companion object {
    fun filterProduitDetail(
      supprimer: Int?,
    ): Specification<ProduitDetail> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        predicates.add(criteriaBuilder.equal(root.get<Int>("supprimer"), supprimer))
        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }
}
