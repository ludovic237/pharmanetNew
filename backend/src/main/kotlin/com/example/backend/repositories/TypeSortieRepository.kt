package com.example.backend.repositories;

import com.example.backend.models.TypeSortie
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor

interface TypeSortieRepository : JpaRepository<TypeSortie, Int>, JpaSpecificationExecutor<TypeSortie> {

  companion object {
    fun filterTypeSortie(
      nom: String?,
    ): Specification<TypeSortie> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        if (!nom.isNullOrEmpty() && nom != "null") {
          predicates.add(
            criteriaBuilder.like(
              criteriaBuilder.lower(root.get<String>("produit").get("nom")),
              "%${nom}%"
            )
          )
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

}
