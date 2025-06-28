package com.example.backend.services

import com.example.backend.models.Forme
import com.example.backend.models.Fournisseur
import com.example.backend.repositories.FormeRepository
import com.example.backend.repositories.FournisseurRepository
import org.springframework.stereotype.Service

@Service
class FournisseurService(private val fournisseurRepository: FournisseurRepository) {

    fun createFournisseur(fournisseur: Fournisseur): Fournisseur = fournisseurRepository.save(fournisseur)

    fun getAllFournisseurs(): List<Fournisseur> = fournisseurRepository.findAll()

    fun updateFournisseur(id: Int, updatedFournisseur: Fournisseur): Fournisseur {
        val existingFournisseur = fournisseurRepository.findById(id).orElseThrow { Exception("Fournisseur not found") }
        existingFournisseur.nom = updatedFournisseur.nom
        return fournisseurRepository.save(existingFournisseur)
    }

    fun deleteFournisseur(id: Int) {
        if (!fournisseurRepository.existsById(id)) throw Exception("Fournisseur not found")
        fournisseurRepository.deleteById(id)
    }
}
