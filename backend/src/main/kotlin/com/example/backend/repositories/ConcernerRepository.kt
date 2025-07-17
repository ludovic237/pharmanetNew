package com.example.backend.repositories;

import com.example.backend.models.Concerner
import com.example.backend.models.Produit
import org.springframework.data.jpa.repository.JpaRepository

interface ConcernerRepository : JpaRepository<Concerner, Int> {
  fun findByVenteIdAndProduitId(vente: Long, produit: Int): Concerner?
  fun findByVenteId(vente: Long): List<Concerner?>
  fun findByProduitId(produit: Int): List<Concerner?>
}
