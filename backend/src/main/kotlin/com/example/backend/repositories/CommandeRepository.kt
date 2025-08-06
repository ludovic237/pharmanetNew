package com.example.backend.repositories;

import com.example.backend.dtos.OrderRowView
import com.example.backend.models.Commande
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface CommandeRepository : JpaRepository<Commande, Long>, JpaSpecificationExecutor<Commande> {

  @Query("SELECT COUNT(c) FROM Commande c WHERE c.supprimer = 0 AND MONTH(c.dateCreation) = MONTH(CURRENT_DATE) AND YEAR(c.dateCreation) = YEAR(CURRENT_DATE)")
  fun countMois(): Long

  companion object {
    fun filterCommandes(
      etat: String?,
      typeFournisseur: String?,
      fournisseurId: String?,
      startDate: String?,
      endDate: String?
    ): Specification<Commande> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        if (!etat.isNullOrEmpty() &&  etat != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("etat"), etat.toUpperCase()))
        }

        if (fournisseurId != null && fournisseurId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Long>("fournisseur").get<Long>("id"), fournisseurId))
        }

        if (typeFournisseur != null && typeFournisseur != "null") {
          predicates.add(criteriaBuilder.equal(root.get<Long>("fournisseur").get<String>("statut"), typeFournisseur))
        }

        if (!startDate.isNullOrEmpty() && !startDate.trim().equals("null", ignoreCase = true)) {
          val startDateTime = LocalDateTime.parse(startDate.trim())
          predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get<LocalDateTime>("dateCreation"), startDateTime))
        }

        if (!endDate.isNullOrEmpty() && !endDate.trim().equals("null", ignoreCase = true)) {
          val endDateTime = LocalDateTime.parse(endDate)
          predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get<LocalDateTime>("dateCreation"), endDateTime))
        }

        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

  @Query(
    value = """
        SELECT cmd.id                AS id,
               cmd.ref               AS ref,
               four.nom              AS fournisseur,
               cmd.montant_cmd       AS montantCmd,
               cmd.montant_recu      AS montantRecu,
               cmd.etat              AS etat,
               cmd.date_creation     AS dateCreation,
               cmd.date_livraison    AS dateLivraison
        FROM commande cmd
        LEFT JOIN fournisseur four ON four.id = cmd.fournisseur_id
        WHERE cmd.supprimer=0
        ORDER BY cmd.date_creation DESC
        LIMIT :limit OFFSET :offset
        """,
    nativeQuery = true
  )
  fun ordersRecent(@Param("limit") limit: Int, @Param("offset") offset: Int): List<OrderRowView>


}
