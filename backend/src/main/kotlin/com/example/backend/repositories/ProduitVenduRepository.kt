package com.example.backend.repositories;

import com.example.backend.dtos.CategorySalesRow
import com.example.backend.dtos.TopProductRow
import com.example.backend.models.ProduitVendu
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface ProduitVenduRepository : JpaRepository<ProduitVendu, Int> {

  @Query(
    value = """
        SELECT p.nom AS nom, COALESCE(SUM(pv.qtite_vendu),0) AS qty
        FROM produit_vendu pv
        JOIN produit p ON p.id = pv.produit_id
        JOIN vente v   ON v.id = pv.vente_id
        WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
        GROUP BY p.nom
        ORDER BY qty DESC
        LIMIT :limit
        """,
    nativeQuery = true
  )
  fun topProducts(@Param("limit") limit: Int, @Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): List<TopProductRow>

  @Query(
    value = """
        SELECT c.nom AS categorie, COALESCE(SUM(pv.qtite_vendu * pv.prix_unit),0) AS total
        FROM produit_vendu pv
        JOIN produit p   ON p.id = pv.produit_id
        JOIN categorie c ON c.id = p.categorie_id
        JOIN vente v     ON v.id = pv.vente_id
        WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to
        GROUP BY c.nom
        ORDER BY total DESC
        """,
    nativeQuery = true
  )
  fun salesByCategory(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): List<CategorySalesRow>


}
