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

        nomProduit?.let {
          predicates.add(
            criteriaBuilder.like(
              criteriaBuilder.lower(root.get<String>("produit").get("nom")),
              "%${it}%"
            )
          )
        }

        typeSortie?.let {
          predicates.add(criteriaBuilder.equal(root.get<String>("typeSortie"), it))
        }

        enRayonId?.let {
          predicates.add(criteriaBuilder.equal(root.get<Long>("enRayon").get<Int>("id"), it))
        }

        produitDetailId?.let {
          predicates.add(criteriaBuilder.equal(root.get<Long>("produitDetail").get<Int>("id"), it))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

}
