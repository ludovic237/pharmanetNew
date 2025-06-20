package com.example.backend.repositories

import com.example.backend.models.TicketCaisse
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface TicketCaisseRepository : JpaRepository<TicketCaisse, Int> {

//    @Query("SELECT t FROM TicketCaisse t WHERE t.codebarre = :codebarre AND t.supprimer = 0")
//    fun findByCodebarre(@Param("codebarre") codebarre: Int): TicketCaisse?
//
    fun findByCodebarre(codebarre: Int): TicketCaisse?
}
