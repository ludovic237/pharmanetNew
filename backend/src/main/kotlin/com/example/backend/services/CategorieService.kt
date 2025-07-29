package com.example.backend.services

import com.example.backend.models.Categorie
import com.example.backend.repositories.CategorieRepository
import org.springframework.stereotype.Service

@Service
class CategorieService(private val categorieRepository: CategorieRepository) {

  fun createCategorie(categorie: Categorie): Categorie = categorieRepository.save(categorie)

  fun getAllCategories(): List<Categorie> = categorieRepository.findAllBySupprimer(0)

  fun updateCategorie(id: Int, updatedCategorie: Categorie): Categorie {
    val existingCategorie = categorieRepository.findById(id).orElseThrow { Exception("Categorie not found") }
    existingCategorie.nom = updatedCategorie.nom
    return categorieRepository.save(existingCategorie)
  }

  fun deleteCategorie(id: Int) {
    if (!categorieRepository.existsById(id)) throw Exception("Categorie not found")
    var categorie = categorieRepository.findById(id).get()
    categorie.supprimer = 1
    categorieRepository.save(categorie)
  }
}
