package com.example.backend.repositories;

import com.example.backend.models.Commande
import com.example.backend.models.Produit
import com.example.backend.models.ProduitCmd
import jakarta.persistence.criteria.JoinType
import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.data.util.Predicates
import java.time.LocalDateTime

interface ProduitCmdRepository : JpaRepository<ProduitCmd, Int>, JpaSpecificationExecutor<ProduitCmd> {
  fun findByCommandeId(commandeId: Long): List<ProduitCmd>
  fun findByCommandeIdAndProduit(commande: Long, produit: Produit): ProduitCmd?
  fun findByProduit(produit: Produit): List<ProduitCmd>
  fun findByCommandeIdAndId(commandeId: Long, id: Int): ProduitCmd

  @Query(
    " SELECT pc " +
      "FROM ProduitCmd pc " +
      "JOIN  pc.commande c " +
      "where c.dateCreation " +
      "between :startDate AND :endDate " +
      "AND pc.produit.id=:produitId "
  )
  fun findByCommandeDateBetweenWithProduitId(
    @Param("startDate") startDate: LocalDateTime?,
    @Param("endDate") endDate: LocalDateTime?,
    @Param("produitId") produitId: Int,
    pageable: Pageable
  ): Page<ProduitCmd>


  companion object {
    fun dateBetweenWithProduitId(
      startDate: LocalDateTime?,
      endDate: LocalDateTime?,
      produitId: String?,
    ): Specification<ProduitCmd> {
      return Specification { root, query, criteriaBuilder ->
        val predicates = mutableListOf<Predicate>()

        predicates.add(
          criteriaBuilder.between(
            (root.join<ProduitCmd, Commande>("commande")
//            (root.join<ProduitCmd,Commande>("commande",JoinType.INNER)
              ).get("dateCreation"),
            startDate!!,
            endDate!!
          )
        )

        if (!produitId.isNullOrEmpty() && produitId != "null") {
          predicates.add(criteriaBuilder.equal(root.get<String>("produitId"), produitId))
        }
        criteriaBuilder.and(*predicates.toTypedArray())
      }
    }
  }

}
