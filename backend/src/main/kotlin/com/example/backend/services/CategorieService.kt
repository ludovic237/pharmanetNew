package com.example.backend.services

import com.example.backend.models.Categorie
import com.example.backend.repositories.CategorieRepository
import org.springframework.stereotype.Service

@Service
class CategorieService(private val categorieRepository: CategorieRepository) {

    fun createCategorie(categorie: Categorie): Categorie = categorieRepository.save(categorie)

    fun getAllCategories(): List<Categorie> = categorieRepository.findAll()

    fun updateCategorie(id: Int, updatedCategorie: Categorie): Categorie {
        val existingCategorie = categorieRepository.findById(id).orElseThrow { Exception("Categorie not found") }
        existingCategorie.nom = updatedCategorie.nom
        return categorieRepository.save(existingCategorie)
    }

    fun deleteCategorie(id: Int) {
        if (!categorieRepository.existsById(id)) throw Exception("Categorie not found")
        categorieRepository.deleteById(id)
    }
}
