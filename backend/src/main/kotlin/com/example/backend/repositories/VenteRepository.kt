package com.example.backend.repositories;

import com.example.backend.models.*
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

interface VenteRepository : JpaRepository<Vente, Long>, JpaSpecificationExecutor<Vente> {
  fun findByCaisseId(caisseId: Long): List<Vente>?
  fun findByCaisseIdAndPrixPercuGreaterThanEqual(caisseId: Long, prixPercu: Double?): List<Vente>?
  fun findByCaisseIdAndPrixPercuGreaterThan(caisseId: Long, prixPercu: Double?): List<Vente>?
  fun findByIdAndSupprimer(id: Long, supprimer: Int): Vente?
  fun findByDateVenteBetweenAndSupprimer(
    startDate: LocalDateTime,
    endDate: LocalDateTime,
    supprimer: Int = 0
  ): List<Vente?>

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
      activeCaisse: Caisse?,
      supprimer: Int?,
      prixPercu: Int?,
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

        if (activeCaisse != null) {
          predicates.add(criteriaBuilder.equal(root.get<Caisse>("caisse"), activeCaisse))
        } else if (activeCaisse == null) {
          predicates.add(criteriaBuilder.isNull(root.get<Caisse>("caisse")))
        } else {
          predicates.add(criteriaBuilder.isNull(root.get<Caisse>("caisse")))
        }

        if (supprimer != null) {
          predicates.add(criteriaBuilder.equal(root.get<Int>("supprimer"), supprimer))
        }

        if (prixPercu == 0) {
          predicates.add(criteriaBuilder.equal(root.get<Int>("prixPercu"), prixPercu))
        } else if (prixPercu!! > 0) {
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get<Int>("prixPercu"), 0))
        }

        if (!userId.isNullOrEmpty() && userId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<User>("user").get<Long>("id"), userId.toLong()))
        }

        if (!employeId.isNullOrEmpty() && employeId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Employe>("employe").get<Long>("id"), employeId.toLong()))
        }

        if (!prescripteurId.isNullOrEmpty() && prescripteurId != "null") {
          predicates.add(
            criteriaBuilder.equal(
              root.get<Prescripteur>("prescripteur").get<Long>("id"),
              prescripteurId.toLong()
            )
          )
        }


        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }

    fun filterVentesRange(
      activeCaisse: Caisse?,
      supprimer: Int?,
      prixPercu: Int?,
      etat: String?,
      startDateVente: String?,
      endDateVente: String?,
      startDateEncaissement: String?,
      endDateEncaissement: String?,
      userId: String?,
      employeId: String?,
      prescripteurId: String?,
      caisseId: String?,
    ): Specification<Vente> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        val startDateTime = LocalDateTime.parse(startDateVente!!.trim())
        val endDateTime = LocalDateTime.parse(endDateVente!!.trim())
        predicates.add(
          criteriaBuilder.between(
            root.get<LocalDateTime>("dateVente"),
            startDateTime,
            endDateTime
          )
        )

        val startDateTimeEncaissement = LocalDateTime.parse(startDateEncaissement!!.trim())
        val endDateTimeEncaissement = LocalDateTime.parse(endDateEncaissement!!.trim())
        predicates.add(
          criteriaBuilder.between(
            root.get<LocalDateTime>("dateEncaissement"),
            startDateTimeEncaissement,
            endDateTimeEncaissement
          )
        )


        if (!etat.isNullOrEmpty() && etat != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("etat"), etat))
        }

        if (activeCaisse != null) {
          predicates.add(criteriaBuilder.equal(root.get<Caisse>("caisse"), activeCaisse))
        }
//        else if (activeCaisse == null) {
//          predicates.add(criteriaBuilder.isNull(root.get<Caisse>("caisse")))
//        } else {
//          predicates.add(criteriaBuilder.isNull(root.get<Caisse>("caisse")))
//        }

        if (supprimer != null) {
          predicates.add(criteriaBuilder.equal(root.get<Int>("supprimer"), supprimer))
        }

        if (prixPercu == 0) {
          predicates.add(criteriaBuilder.equal(root.get<Int>("prixPercu"), prixPercu))
        } else if (prixPercu!! > 0) {
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get<Int>("prixPercu"), 0))
        }

        if (!userId.isNullOrEmpty() && userId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<User>("user").get<Long>("id"), userId.toLong()))
        }

        if (!employeId.isNullOrEmpty() && employeId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Employe>("employe").get<Long>("id"), employeId.toLong()))
        }

        if (!prescripteurId.isNullOrEmpty() && prescripteurId != "null") {
          predicates.add(
            criteriaBuilder.equal(
              root.get<Prescripteur>("prescripteur").get<Long>("id"),
              prescripteurId.toLong()
            )
          )
        }


        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

  fun findByReferenceAndSupprimer(reference: String, supprimer: Int): Vente?

  // === KPIs ===
  @Query(
    value = """
        SELECT COALESCE(SUM(prix_total),0)
        FROM vente
        WHERE supprimer=0 AND date_vente BETWEEN :from AND :to
        """,
    nativeQuery = true
  )
  fun kpiCa(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): Double

  @Query(
    value = """
        SELECT COALESCE(SUM(prix_percu),0)
        FROM vente
        WHERE supprimer=0 AND date_encaissement BETWEEN :from AND :to
        """,
    nativeQuery = true
  )
  fun kpiEncaisse(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): Double

  @Query(
    value = """
        SELECT COUNT(*)
        FROM vente
        WHERE supprimer=0 AND date_vente BETWEEN :from AND :to
        """,
    nativeQuery = true
  )
  fun kpiTickets(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): Long

  // === Graphs ===
  interface SalesMonthlyRow { fun getMois(): String; fun getTotal(): Double }
  @Query(
    value = """
        SELECT DATE_FORMAT(date_vente, '%Y-%m') AS mois, COALESCE(SUM(prix_total),0) AS total
        FROM vente
        WHERE supprimer=0 AND date_vente BETWEEN :from AND :to
        GROUP BY mois ORDER BY mois
        """,
    nativeQuery = true
  )
  fun salesMonthly(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): List<SalesMonthlyRow>


}
