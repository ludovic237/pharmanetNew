package com.example.backend.repositories;

import com.example.backend.models.FactureEspece
import org.springframework.data.jpa.repository.JpaRepository

interface FactureEspeceRepository : JpaRepository<FactureEspece, Int> {
  fun findByFacturationId(facturationId: Long): FactureEspece
  fun existsByFacturationId(facturationId: Long): Boolean
}
