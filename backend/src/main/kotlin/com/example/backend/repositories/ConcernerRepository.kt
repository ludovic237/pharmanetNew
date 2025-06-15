package com.example.backend.repositories;

import com.example.backend.models.Concerner
import com.example.backend.models.Produit
import com.example.backend.models.Vente
import org.springframework.data.jpa.repository.JpaRepository

interface ConcernerRepository : JpaRepository<Concerner, Int> {
  fun findByVenteAndProduit(vente: Vente, produit: Produit): Concerner?
  fun findByVente(vente: Vente): Concerner?
}
