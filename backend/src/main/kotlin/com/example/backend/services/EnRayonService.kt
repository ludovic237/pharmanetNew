package com.example.backend.services

import com.example.backend.dtos.EnRayonDto
import com.example.backend.dtos.ProduitEnRayonDto
import com.example.backend.models.EnRayon
import com.example.backend.models.Forme
import com.example.backend.repositories.*
import jakarta.persistence.criteria.Predicate
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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
  fun getProduitsEnRayonParProduitIdt(produitId: Int): List<Map<String, Any?>> {
    val enRayonList = enRayonRepository.findByProduitAndSupprimer(produitRepository.findById(produitId).get())

    return enRayonList.map { enRayon ->
      val minReduction = minOf(enRayon.produit?.reductionMax ?: 0, enRayon.reduction ?: 0)
      mapOf(
        "id" to enRayon.id,
        "produit" to mapOf(
          "id" to enRayon.produit?.id,
          "ean13" to enRayon.produit?.ean13,
          "nom" to enRayon.produit?.nom,
          "stock" to enRayon.produit?.stock,
          "etat" to enRayon.produit?.etat,
          "reductionMax" to enRayon.produit?.reductionMax,
          "categorie" to mapOf(
            "id" to enRayon.produit?.categorie?.id,
            "nom" to enRayon.produit?.categorie?.nom
          ),
          "forme" to mapOf(
            "id" to enRayon.produit?.forme?.id,
            "code" to enRayon.produit?.forme?.code,
            "nom" to enRayon.produit?.forme?.nom
          ),
          "fabriquant" to mapOf(
            "id" to enRayon.produit?.fabriquant?.id,
            "code" to enRayon.produit?.fabriquant?.code,
            "nom" to enRayon.produit?.fabriquant?.nom
          ),
          "rayon" to mapOf(
            "id" to enRayon.produit?.rayon?.id
          ),
          "etagere" to enRayon.produit?.etagere,
          "magasin" to mapOf(
            "id" to enRayon.produit?.magasin?.id,
            "code" to enRayon.produit?.magasin?.code,
            "nom" to enRayon.produit?.magasin?.nom
          ),
          "createdAt" to enRayon.produit?.createdAt,
          "updatedAt" to enRayon.produit?.updatedAt
        ),
        "rayon" to enRayon.rayon?.let { mapOf("id" to it.id) },
        "fournisseur" to mapOf(
          "id" to enRayon.fournisseur?.id,
          "code" to enRayon.fournisseur?.code,
          "nom" to enRayon.fournisseur?.nom,
          "statut" to enRayon.fournisseur?.statut,
          "supprimer" to enRayon.fournisseur?.supprimer
        ),
        "unite" to enRayon.unite,
        "commande" to enRayon.commande?.let { mapOf("id" to it.id) },
        "dateLivraison" to enRayon.dateLivraison,
        "datePeremption" to enRayon.datePeremption,
        "prixAchat" to enRayon.prixAchat,
        "prixVente" to enRayon.prixVente,
        "reduction" to minReduction,
        "quantite" to enRayon.quantite,
        "quantiteRestante" to enRayon.quantiteRestante
      )
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

//  @Transactional
//  fun getProduitsEnRayonParUniter(uniter: String): List<EnRayon> =
//      enRayonRepository.findByProduitUniterContainingIgnoreCaseAndSupprimer(uniter, 0)

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

  @Transactional
  fun mettreAJourProduitEnRayon(produitDto: EnRayonDto): EnRayon {
    val enRayon = enRayonRepository.findById(produitDto.enRayonId!!.toInt())
      .orElseThrow { RuntimeException("Produit en rayon introuvable avec l'ID: ${produitDto.enRayonId}") }

    val produit = enRayon.produit ?: throw RuntimeException("Produit introuvable pour l'ID: ${produitDto.enRayonId}")

    produit.apply {
      this.stock =
        (produit.stock!! - enRayon.quantiteRestante!!) + produitDto.quantiteRestante!! // Update the stock of the product
    }

    produitRepository.save(produit) // Save the updated product

    enRayon.apply {
      this.reduction = produitDto.reductionMax
      this.prixAchat = produitDto.prixAchat
      this.prixVente = produitDto.prixVente
      this.quantiteRestante = produitDto.quantiteRestante
      this.datePeremption = produitDto.datePeremption?.let { LocalDateTime.parse(it) }
    }
    return enRayonRepository.save(enRayon) // Save the updated EnRayon
  }


  @Transactional
  fun getProduitsEnRayonPageable(
    nomProduit: String?,
    bientotPerimee: Boolean?,
    joursAvantPeremption: Int?,
    enStock: Boolean?,
    pageable: Pageable
  ): Page<Map<String, Any?>> {
    val specification = EnRayonRepository.filterEnRayon(nomProduit, bientotPerimee, joursAvantPeremption, enStock)
    return enRayonRepository.findAll(specification,pageable)
      .map { enRayon ->
        mapOf(
          "id" to enRayon.id,
            "produitId" to enRayon.produit!!.id,
            "produitNom" to enRayon.produit!!.nom,
            "rayonId" to enRayon.rayon?.id,
            "rayonNom" to enRayon.rayon?.nom,
            "fournisseurId" to enRayon.fournisseur!!.id,
            "fournisseurNom" to enRayon.fournisseur!!.nom,
            "unite" to enRayon.unite,
            "commandeId" to enRayon.commande!!.id,
            "commandeRef" to enRayon.commande!!.ref,
            "dateLivraison" to enRayon.dateLivraison,
            "datePeremption" to enRayon.datePeremption,
            "prixAchat" to enRayon.prixAchat,
            "prixVente" to enRayon.prixVente,
            "reduction" to enRayon.reduction,
            "quantite" to enRayon.quantite,
            "quantiteRestante" to enRayon.quantiteRestante,
            "supprimer" to enRayon.supprimer,
        )
      }
  }

}
