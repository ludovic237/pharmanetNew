package com.example.backend.repositories;

import com.example.backend.models.Caisse
import com.example.backend.models.Depense
import com.example.backend.models.RetourProduit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface RetourProduitRepository : JpaRepository<RetourProduit, Int> {
  fun findByCaisse(caisse: Caisse): List<RetourProduit>?

  @Query(
    value = """
        SELECT
          (SELECT COUNT(*) FROM retour_produit r WHERE r.date_retour BETWEEN :from AND :to) * 1.0 /
          NULLIF((SELECT COUNT(*) FROM vente v WHERE v.supprimer=0 AND v.date_vente BETWEEN :from AND :to), 0)
        """,
    nativeQuery = true
  )
  fun kpiTauxRetour(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): Double?


}

