package com.example.backend.repositories;

import com.example.backend.models.Caisse
import com.example.backend.models.Employe
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface CaisseRepository : JpaRepository<Caisse, Int> {
  fun findByEtatAndSupprimer(etat: String, supprimer: Int = 0): List<Caisse>
  fun findByEmployeAndEtatAndSupprimer(employe: Employe, etat: String, supprimer: Int = 0): Optional<Caisse>
  fun findByEmployeAndSupprimerOrderByDateOuvertDesc(employe: Employe, supprimer: Int = 0): List<Caisse>
}
