package com.example.backend.repositories;

import com.example.backend.models.FactureElectronique
import org.springframework.data.jpa.repository.JpaRepository

interface FactureElectroniqueRepository : JpaRepository<FactureElectronique, Int> {
  fun findByFacturationId(facturationId: Long): FactureElectronique
  fun existsByFacturationId(facturationId: Long): Boolean
}
