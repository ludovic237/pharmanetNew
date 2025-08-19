package com.example.backend.repositories;

import com.example.backend.dtos.CategorySalesRow
import com.example.backend.dtos.TopProductRow
import com.example.backend.models.Concerner
import com.example.backend.models.EnRayon
import com.example.backend.models.Produit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface ConcernerRepository : JpaRepository<Concerner, Int> {
  fun findByVenteIdAndProduitId(vente: Long, produit: Int): Concerner?
  fun findByVenteIdAndEnRayonId(vente: Long, enRayonId: String): Concerner?
  fun findByVenteIdAndEnRayonIdIn(vente: Long, enRayonId: List<String?>): List<Concerner?>
  fun findByVenteId(vente: Long): List<Concerner?>
  fun findByProduitId(produit: Int): List<Concerner?>


  @Query(
    value = """
    SELECT p.nom AS nom,
           COALESCE(SUM(con.quantite),0) AS qty
    FROM concerner con
    JOIN produit p ON p.id = con.produit_id
    JOIN vente   v ON v.id = con.vente_id
    WHERE v.supprimer=0
      AND v.date_vente BETWEEN :from AND :to
    GROUP BY p.nom
    ORDER BY qty DESC
    LIMIT :limit
    """,
    nativeQuery = true
  )
  fun topProducts(
    @Param("limit") limit: Int,
    @Param("from")  from: LocalDateTime,
    @Param("to")    to:    LocalDateTime
  ): List<TopProductRow>

  @Query(
    value = """
    SELECT c.nom AS categorie,
           COALESCE(SUM(con.prix_unit * con.quantite),0) AS total
    FROM concerner con
    JOIN vente v      ON v.id      = con.vente_id
    JOIN produit p    ON p.id      = con.produit_id
    JOIN categorie c  ON c.id      = p.categorie_id
    WHERE v.supprimer=0
      AND v.date_vente BETWEEN :from AND :to
    GROUP BY c.nom
    ORDER BY total DESC
    """,
    nativeQuery = true
  )
  fun salesByCategory(
    @Param("from") from: LocalDateTime,
    @Param("to")   to:   LocalDateTime
  ): List<CategorySalesRow>
}
