package com.example.backend.repositories;

import com.example.backend.models.Fournisseur
import org.springframework.data.jpa.repository.JpaRepository

interface FournisseurRepository : JpaRepository<Fournisseur, Int> {

  fun findByEmailAndSupprimer(email: String, supprimer: Int): Fournisseur
  fun findByEmail(email: String): Fournisseur
  fun findAllBySupprimer(supprimer: Int = 0): List<Fournisseur>

}
