package com.example.backend.repositories;

import com.example.backend.models.Depense
import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository

interface DepenseRepository : JpaRepository<Depense, Int> {
  fun findByCaisseId(caisseId: String): List<Depense>?
}
