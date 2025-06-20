package com.example.backend.repositories

import com.example.backend.models.BonCaisse
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface BonCaisseRepository : JpaRepository<BonCaisse, Int> {

     fun findByCodebarreId(codebarreId: String): BonCaisse?
}
