package com.example.backend.repositories;

import com.example.backend.models.Rayon
import org.springframework.data.jpa.repository.JpaRepository

interface RayonRepository : JpaRepository<Rayon, Int> {
fun findByNomAndSupprimer(nom: String, supprimer: Int = 0): Rayon?
fun findByNom(nom: String): Boolean?
fun findAllBySupprimer(supprimer: Int = 0): List<Rayon>?
}
