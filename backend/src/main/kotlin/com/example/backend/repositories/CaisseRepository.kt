package com.example.backend.repositories;

import com.example.backend.models.Caisse
import com.example.backend.models.Employe
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface CaisseRepository : JpaRepository<Caisse, Int>, JpaSpecificationExecutor<Caisse> {
  fun findByEtatAndSupprimer(etat: String, supprimer: Int = 0): List<Caisse>
//  fun findByUserAndEtatAndSupprimer(employe: Employe,etat: String, supprimer: Int = 0): List<Caisse>
  fun existsByEtatAndSupprimer(etat: String, supprimer: Int = 0): Boolean
  fun findByUserAndEtatAndSupprimer(employe: Employe, etat: String, supprimer: Int = 0): List<Caisse>
  fun findByUserAndEtat(employe: Employe, etat: String): Caisse
  fun findByUserAndSupprimerOrderByDateOuvertDesc(employe: Employe, supprimer: Int = 0): List<Caisse>

  companion object {
    fun filterByCriteria(caisseId: Long?, startDate: LocalDate?, endDate: LocalDate?): Specification<Caisse> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        if (caisseId != null) {
          predicates.add(criteriaBuilder.equal(root.get<Long>("id"), caisseId))
        }
        if (startDate != null) {
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("dateOuvert"), startDate))
        }
        if (endDate != null) {
          predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("dateFerme"), endDate))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

  @Query(
    value = """SELECT COUNT(*) FROM caisse WHERE supprimer=0 AND etat='OUVERT'""",
    nativeQuery = true
  )
  fun sessionsOuvertes(): Long

  @Query(
    value = """SELECT COUNT(*) FROM caisse WHERE supprimer=0 AND etat='FERME'""",
    nativeQuery = true
  )
  fun sessionsCloturees(): Long


}
