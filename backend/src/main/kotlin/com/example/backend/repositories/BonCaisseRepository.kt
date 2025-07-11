package com.example.backend.repositories

import com.example.backend.models.BonCaisse
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface BonCaisseRepository : JpaRepository<BonCaisse, Int> {

     fun findByCodebarreId(codebarreId: String): BonCaisse?
  // After
  @Query("SELECT b FROM BonCaisse b WHERE b.caisse.id = :caisseId AND b.type = 'Générer'")
  fun findGeneratedByCaisseId(@Param("caisseId") caisseId: String): List<BonCaisse>?

  @Query("SELECT b FROM BonCaisse b WHERE b.caisse.id = :caisseId AND b.type = 'Encaisser'")
  fun findEncaisseByCaisseId(@Param("caisseId") caisseId: String): List<BonCaisse>?
}
