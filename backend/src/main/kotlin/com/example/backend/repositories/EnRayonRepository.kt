package com.example.backend.repositories;

import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.Produit
import com.example.backend.models.Rayon
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime
import java.util.*

interface EnRayonRepository : JpaRepository<EnRayon, Int> {
  fun findByProduitAndRayonAndSupprimer(
    produit: Produit,
    rayon: Rayon?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findByProduitAndCommandeAndSupprimer(
    produit: Produit,
    commande: Commande?, // Rayon can be null if stock is at depot level
    supprimer: Int = 0
  ): Optional<EnRayon>

  fun findByProduitAndSupprimer(
    produit: Produit,
    supprimer: Int = 0
  ): EnRayon

  fun findAllByProduitAndSupprimer(produit: Produit, supprimer: Int = 0): List<EnRayon>

  fun findByProduitNomContainingIgnoreCaseAndSupprimer(nomProduit: String, supprimer: Int): List<EnRayon>
  fun findByRayonNomContainingIgnoreCaseAndSupprimer(nomRayon: String, supprimer: Int): List<EnRayon>
  fun findByFournisseurNomContainingIgnoreCaseAndSupprimer(nomFournisseur: String, supprimer: Int): List<EnRayon>
  fun findByProduitUniterContainingIgnoreCaseAndSupprimer(uniter: String, supprimer: Int): List<EnRayon>
  fun findByCommandeIdAndSupprimer(commandeId: Long, supprimer: Int): List<EnRayon>
  fun findByDateLivraisonBetweenAndSupprimer(startDate: LocalDateTime, endDate: LocalDateTime, supprimer: Int): List<EnRayon>
  fun findByDatePeremptionBetweenAndSupprimer(startDate: LocalDateTime, endDate: LocalDateTime, supprimer: Int): List<EnRayon>
  fun findByPrixAchatBetweenAndSupprimer(minPrix: Double, maxPrix: Double, supprimer: Int): List<EnRayon>
  fun findByPrixVenteBetweenAndSupprimer(minPrix: Double, maxPrix: Double, supprimer: Int): List<EnRayon>

}
