package com.example.backend.services

import com.example.backend.models.EnRayonInventaire
import com.example.backend.repositories.EnRayonInventaireRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EnRayonInventaireService(private val enRayonInventaireRepository: EnRayonInventaireRepository) {

    @Transactional
    fun ajouterProduitsEnRayon(produits: List<EnRayonInventaire>): List<EnRayonInventaire> {
        return enRayonInventaireRepository.saveAll(produits)
    }

    @Transactional
    fun mettreAJourProduitsEnRayon(produits: List<EnRayonInventaire>): List<EnRayonInventaire> {
        produits.forEach { produit ->
            if (produit.id != null) {
                val existingProduct = enRayonInventaireRepository.findById(produit.id!!)
                if (existingProduct.isPresent) {
                    val updatedProduct = existingProduct.get().apply {
                        inventaireId = produit.inventaireId
                        enRayonId = produit.enRayonId
                        employeId = produit.employeId
                        quantiteRayon = produit.quantiteRayon
                        quantiteInventaire = produit.quantiteInventaire
                        dateDebut = produit.dateDebut
                        dateFin = produit.dateFin
                        type = produit.type
                        statut = produit.statut
                        supprimer = produit.supprimer
                    }
                    enRayonInventaireRepository.save(updatedProduct)
                }
            }
        }
        return enRayonInventaireRepository.saveAll(produits.filter { it.id == null })
    }
}
