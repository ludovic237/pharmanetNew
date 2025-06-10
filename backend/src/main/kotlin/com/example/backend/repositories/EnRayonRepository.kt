package com.example.backend.repositories;

import com.example.backend.models.EnRayon
import com.example.backend.models.Produit
import com.example.backend.models.Rayon
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface EnRayonRepository : JpaRepository<EnRayon, Int> {
  fun findByProduitAndRayonAndSupprimer(
    produit: Produit,
    rayon: Rayon?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findAllByProduitAndSupprimer(produit: Produit, supprimer: Int = 0): List<EnRayon>
}
