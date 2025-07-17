package com.example.backend.repositories;

import com.example.backend.models.Produit
import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import java.util.*

interface ProduitRepository : JpaRepository<Produit, Int>, JpaSpecificationExecutor<Produit> {
  fun findByCodeUbipharmAndSupprimer(codebarre: String, supprimer: Int = 0): Optional<Produit>
  fun findAllBySupprimer(supprimer: Int = 0): List<Produit>
  fun findByNomContainingIgnoreCaseAndSupprimer(nom: String, supprimer: Int = 0): List<Produit>
  fun findByNomContainingIgnoreCase(nom: String): List<Produit>
  fun findByNomContaining(nom: String): List<Produit>
  fun findByDetailId(detailId: Int): List<Produit>
  fun findByIdAndDetailId(productId: Int, productDetailId: Int): Produit
  fun findByNomContainingIgnoreCase(nom: String, pageable: Pageable): Page<Produit>


  object ProduitSpecification {
    fun withFilters(
      query: String?,
      rayonId: String?,
      fabriquantId: String?,
      etagereId: String?,
      formeId: String?,
      magasinId: String?,
      categorieId: String?
    ): Specification<Produit> {
      return Specification { root, _, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("nom")), "%${query!!.lowercase()}%"))
        if (rayonId != null && rayonId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("rayon").get<Int>("id"), rayonId))
        }
        if (fabriquantId != null && fabriquantId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("fabriquant").get<Int>("id"), fabriquantId))
        }
        if (etagereId != null && etagereId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("etagere").get<Int>("id"), etagereId))
        }
        if (formeId != null && formeId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("forme").get<Int>("id"), formeId))
        }
        if (magasinId != null && magasinId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("magasin").get<Int>("id"), magasinId))
        }
        if (categorieId != null && categorieId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Int>("categorie").get<Int>("id"), categorieId))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }
}
