package com.example.backend.services

import com.example.backend.dtos.ProduitEnRayonDto
import com.example.backend.models.EnRayon
import com.example.backend.models.Forme
import com.example.backend.repositories.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class EnRayonService(
  private val formeRepository: FormeRepository,
  private val produitRepository: ProduitRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val enRayonRepository: EnRayonRepository,
  private val rayonRepository: RayonRepository,
) {

  @Transactional
  fun ajouterProduitsEnRayon(produits: List<ProduitEnRayonDto>): List<EnRayon> {
      return produits.map { produitDto ->
          val produit = produitRepository.findById(produitDto.produitId.toInt())
              .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitDto.produitId}") }

          val fournisseur = fournisseurRepository.findById(produitDto.fournisseurId!!.toInt())
              .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitDto.produitId}") }

          val rayon = rayonRepository.findById(produitDto.rayonId!!.toInt())
              .orElseThrow { RuntimeException("Rayon introuvable avec l'ID: ${produitDto.rayonId}") }

          val enRayon = EnRayon().apply {
              this.produit = produit
              this.fournisseur = fournisseur
              this.rayon = rayon
              this.quantite = produitDto.quantite
              this.prixAchat = produitDto.prixAchat
              this.prixVente = produitDto.prixVente
              this.quantiteRestante = produitDto.quantiteRestante
              this.datePeremption = produitDto.datePeremption
              this.dateLivraison = produitDto.dateLivraison
              this.supprimer = 0
          }

          enRayonRepository.save(enRayon)
      }
  }

  @Transactional
  fun mettreAJourProduitsEnRayon(produits: List<ProduitEnRayonDto>): List<EnRayon> {
      return produits.map { produitDto ->
          val enRayon = enRayonRepository.findById(produitDto.enRayonId!!.toInt())
              .orElseThrow { RuntimeException("Produit en rayon introuvable avec l'ID: ${produitDto.enRayonId}") }

          enRayon.apply {
              this.quantite = produitDto.quantite
              this.datePeremption = produitDto.datePeremption
          }

          enRayonRepository.save(enRayon)
      }
  }

  @Transactional
  fun getProduitsEnRayonParNomProduit(nomProduit: String): List<EnRayon> =
      enRayonRepository.findByProduitNomContainingIgnoreCaseAndSupprimer(nomProduit, 0)

  @Transactional
  fun getProduitsEnRayonParNomRayon(nomRayon: String): List<EnRayon> =
      enRayonRepository.findByRayonNomContainingIgnoreCaseAndSupprimer(nomRayon, 0)

  @Transactional
  fun getProduitsEnRayonParFournisseur(nomFournisseur: String): List<EnRayon> =
      enRayonRepository.findByFournisseurNomContainingIgnoreCaseAndSupprimer(nomFournisseur, 0)

  @Transactional
  fun getProduitsEnRayonParUniter(uniter: String): List<EnRayon> =
      enRayonRepository.findByProduitUniterContainingIgnoreCaseAndSupprimer(uniter, 0)

  @Transactional
  fun getProduitsEnRayonParCommande(commandeId: Long): List<EnRayon> =
      enRayonRepository.findByCommandeIdAndSupprimer(commandeId, 0)

  @Transactional
  fun getProduitsEnRayonParIntervalleDateLivraison(startDate: LocalDateTime, endDate: LocalDateTime): List<EnRayon> =
      enRayonRepository.findByDateLivraisonBetweenAndSupprimer(startDate, endDate, 0)

  @Transactional
  fun getProduitsEnRayonParIntervalleDatePeremption(startDate: LocalDateTime, endDate: LocalDateTime): List<EnRayon> =
      enRayonRepository.findByDatePeremptionBetweenAndSupprimer(startDate, endDate, 0)

  @Transactional
  fun getProduitsEnRayonParIntervallePrixAchat(minPrix: Double, maxPrix: Double): List<EnRayon> =
      enRayonRepository.findByPrixAchatBetweenAndSupprimer(minPrix, maxPrix, 0)

  @Transactional
  fun getProduitsEnRayonParIntervallePrixVente(minPrix: Double, maxPrix: Double): List<EnRayon> =
      enRayonRepository.findByPrixVenteBetweenAndSupprimer(minPrix, maxPrix, 0)
}
