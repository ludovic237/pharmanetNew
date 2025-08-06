package com.example.backend.repositories;

import com.example.backend.models.Depense
import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.LocalDateTime

interface DepenseRepository : JpaRepository<Depense, Int> {
  fun findByCaisseId(caisseId: String): List<Depense>?

  @Query(
    value = """
        SELECT COALESCE(SUM(prix_unitaire*quantite),0)
        FROM depense
        WHERE supprimer=0 AND date_depense BETWEEN :from AND :to
        """,
    nativeQuery = true
  )
  fun kpiDepenses(@Param("from") from: LocalDateTime, @Param("to") to: LocalDateTime): Double


}
