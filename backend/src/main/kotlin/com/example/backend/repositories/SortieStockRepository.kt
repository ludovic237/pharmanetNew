package com.example.backend.repositories;

import com.example.backend.models.EnRayon
import com.example.backend.models.SortieStock
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface SortieStockRepository : JpaRepository<SortieStock, Int>, JpaSpecificationExecutor<SortieStock> {

  companion object {
    fun filterSortieStock(
      nomProduit: String?,
      typeSortie: String?,
      enRayonId: Long?,
      produitDetailId: Long?
    ): Specification<SortieStock> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        if (!nomProduit.isNullOrEmpty() && nomProduit != "null") {
          predicates.add(
            criteriaBuilder.like(
              criteriaBuilder.lower(root.get<String>("produit").get("nom")),
              "%${nomProduit}%"
            )
          )
        }

        if (!typeSortie.isNullOrEmpty() && typeSortie != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("typeSortie"), typeSortie))
        }

        if (enRayonId != null) {
          predicates.add(criteriaBuilder.equal(root.get<Long>("enRayon").get<Int>("id"), enRayonId))
        }

        if (produitDetailId != null && produitDetailId != 0L) {
          predicates.add(criteriaBuilder.equal(root.get<Long>("produitDetail").get<Int>("id"), produitDetailId))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

}
