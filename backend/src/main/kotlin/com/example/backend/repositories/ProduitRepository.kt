package com.example.backend.repositories;

import com.example.backend.models.Produit
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface ProduitRepository : JpaRepository<Produit, Int> {
  fun findByCodeUbipharmAndSupprimer(codebarre: String, supprimer: Int = 0): Optional<Produit>
  fun findAllBySupprimer(supprimer: Int = 0): List<Produit>
  fun findByNomContainingIgnoreCaseAndSupprimer(nom: String, supprimer: Int = 0): List<Produit>
  fun findByNomContainingIgnoreCase(nom: String): List<Produit>
  fun findByNomContaining(nom: String): List<Produit>
  fun findByNomContainingIgnoreCase(nom: String, pageable: Pageable): Page<Produit>
}
