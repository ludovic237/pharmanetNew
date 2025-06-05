package com.example.backend.repositories;

import com.example.backend.models.BonCaisse
import org.springframework.data.jpa.repository.JpaRepository

interface BonCaisseRepository : JpaRepository<BonCaisse, Int> {
}
