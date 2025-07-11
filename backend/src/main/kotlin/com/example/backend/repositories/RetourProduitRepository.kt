package com.example.backend.repositories;

import com.example.backend.models.Caisse
import com.example.backend.models.Depense
import com.example.backend.models.RetourProduit
import org.springframework.data.jpa.repository.JpaRepository

interface RetourProduitRepository : JpaRepository<RetourProduit, Int> {
  fun findByCaisse(caisse: Caisse): List<RetourProduit>?
}
