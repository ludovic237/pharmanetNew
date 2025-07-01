package com.example.backend.repositories;

import com.example.backend.models.*
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

interface VenteRepository : JpaRepository<Vente, Long> , JpaSpecificationExecutor<Vente> {
  fun findByIdAndSupprimer(id: Long, supprimer: Int): Vente?
  fun findByIdAndEtat(id: Long, etat: String): Vente?

  @Query("SELECT v FROM Vente v WHERE v.supprimer = 0  AND (v.prixPercu = 0 OR v.prixPercu IS NULL)")
  fun findVentesWithPrixPercuZero(): List<Vente>

  @Query("SELECT v FROM Vente v WHERE v.prixPercu > 0 AND  v.supprimer = 0  ")
  fun findVentesWithPrixPercu(): List<Vente>

  fun findByPrixPercuGreaterThan(prixPercu: Double): List<Vente>

  fun findByPrixPercuEquals(prixPercu: Double): List<Vente>

  @Query("SELECT COUNT(c) FROM Vente c WHERE c.supprimer = 0 AND MONTH(c.dateVente) = MONTH(CURRENT_DATE) AND YEAR(c.dateVente) = YEAR(CURRENT_DATE)")
  fun countMois(): Long


  companion object {
    fun filterVentes(
      etat: String?,
      dateVente: String?,
      dateEncaissement: String?,
      userId: String?,
      employeId: String?,
      prescripteurId: String?,
      caisseId: String?,
    ): Specification<Vente> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

//        dateVente?.let {
//          val date = LocalDate.parse(it, DateTimeFormatter.ISO_DATE)
//          predicates.add(criteriaBuilder.equal(root.get<LocalDateTime>("dateVente").`as`(LocalDate::class.java), date))
//        }
//
//        dateEncaissement?.let {
//          val date = LocalDate.parse(it, DateTimeFormatter.ISO_DATE)
//          predicates.add(criteriaBuilder.equal(root.get<LocalDateTime>("dateEncaissement").`as`(LocalDate::class.java), date))
//        }

        if (!etat.isNullOrEmpty() && etat != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("etat"), etat))
        }

        if (!userId.isNullOrEmpty() && userId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<User>("user").get<Long>("id"), caisseId))
        }

        if (!employeId.isNullOrEmpty() && employeId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Employe>("employe").get<Long>("id"), caisseId))
        }

        if (!prescripteurId.isNullOrEmpty() && prescripteurId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Prescripteur>("prescripteur").get<Long>("id"), caisseId))
        }

        if (!caisseId.isNullOrEmpty() && caisseId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Caisse>("caisse").get<Long>("id"), caisseId))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

  fun findByReferenceAndSupprimer(reference: String, supprimer: Int): Vente?
}
