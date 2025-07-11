package com.example.backend.repositories;

import com.example.backend.models.Caisse
import com.example.backend.models.Facturation
import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository

interface FacturationRepository : JpaRepository<Facturation, Long> {
  fun findByVente(vente: Vente): Facturation?

  fun findByCaisse(caisse: Caisse): List<Facturation>?
}
