package com.example.backend.repositories;

import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface VenteRepository : JpaRepository<Vente, Long> {
  fun findByIdAndSupprimer(id: Long, supprimer: Int): Vente?
  fun findByIdAndEtat(id: Long, etat: String): Vente?

  @Query("SELECT v FROM Vente v WHERE v.prixPercu = 0 OR v.prixPercu IS NULL")
  fun findVentesWithPrixPercuZero(): List<Vente>

  @Query("SELECT v FROM Vente v WHERE v.prixPercu > 0 ")
  fun findVentesWithPrixPercu(): List<Vente>

  fun findByPrixPercuGreaterThan(prixPercu: Double): List<Vente>

  fun findByPrixPercuEquals(prixPercu: Double): List<Vente>

  @Query("SELECT COUNT(c) FROM Vente c WHERE c.supprimer = 0 AND MONTH(c.dateVente) = MONTH(CURRENT_DATE) AND YEAR(c.dateVente) = YEAR(CURRENT_DATE)")
  fun countMois(): Long

}
