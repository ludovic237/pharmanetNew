package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.ProduitCmd
import com.example.backend.repositories.*
import jakarta.persistence.EntityNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class CommandeService(
  private val employeRepository: EmployeRepository,
  private val produitCmdRepository: ProduitCmdRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val commandeRepository: CommandeRepository,
  private val produitRepository: ProduitRepository,
  private val enRayonRepository: EnRayonRepository,
  private val userRepository: UserRepository
) {

  fun createCommande(request: CommandeRequest): Commande {
    if (request.produits.isEmpty()) {
      throw IllegalArgumentException("La commande doit contenir au moins un produit.")
    }

    val quantiteTotale = request.produits.sumOf { it.quantite }
    val montantTotal = request.produits.sumOf { it.quantite * it.prixUnitaire }

    val commande = Commande().apply {
      this.employe = employeRepository.findById(request.employeId.toInt())
        .orElseThrow { IllegalArgumentException("Employé non trouvé avec l'ID fourni.") }
      this.fournisseur = fournisseurRepository.findById(request.fournisseurId.toInt())
        .orElseThrow { IllegalArgumentException("Fournisseur non trouvé avec l'ID fourni.") }
      this.dateCreation = LocalDateTime.now()
      this.dateLivraison = null
      this.qtiteCmd = quantiteTotale
      this.montantCmd = montantTotal
      this.etat = Commande.COMMANDE_EN_ATTENTE
      this.supprimer = 0
    }

    val savedCommande = commandeRepository.save(commande)

    // Ajout des produits dans la table ProduitCommande
    request.produits.forEach { produitRequest ->
      val produitCommande = ProduitCmd().apply {
        this.commande = savedCommande
        this.produit = produitRepository.findById(produitRequest.id.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID fourni.") }
        this.puRecept = 0.0
        this.puCmd = 0.0
        this.qtiteRecu = 0
        this.qtiteCmd = produitRequest.quantite
        this.prixPublic = produitRequest.prixUnitaire
        this.uniteGratuite = 0
      }
      produitCmdRepository.save(produitCommande)
    }

    return savedCommande
  }

  fun annulerCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_ANNULER
    return commandeRepository.save(commande)
  }

  fun cloturerCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_CLOTURE

    produitCmdRepository.findByCommandeId(commandeId)
      .forEach { produitCommande ->
        var enRayon = EnRayon().apply {
          this.produit = produitCommande.produit
          this.rayon = null
          this.fournisseur = commande.fournisseur
          this.unite = null
          this.commande = commande
          this.dateLivraison = commande.dateLivraison ?: LocalDateTime.now()
          this.datePeremption = commande.dateLivraison?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
          this.prixAchat = produitCommande.puCmd?.toInt() ?: 0
          this.prixVente = produitCommande.prixPublic?.toInt() ?: 0
          this.reduction = 0
          this.quantite = produitCommande.qtiteRecu
          this.quantiteRestante = produitCommande.qtiteRecu
          this.supprimer = 0
        }
        enRayonRepository.save(enRayon)
        var produit = produitRepository.findById(produitCommande.produit?.id!!)
          .orElseThrow { EntityNotFoundException("Produit non trouvé avec l'ID fourni.") }
        produit.stock = produit.stock?.plus(produitCommande.qtiteRecu!!)
        produitRepository.save(produit)
      }
    return commandeRepository.save(commande)
  }

  fun livrerCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    commande.etat = Commande.COMMANDE_LIVREE
    commande.dateLivraison = LocalDateTime.now()

    // Envoi des produits en rayon
    val produitsCommande = produitCmdRepository.findByCommandeId(commandeId)
    produitsCommande.forEach { produitCommande ->
      val produit = produitCommande.produit
      produit!!.stock = produitCommande.qtiteRecu!! + produit.stock!!
      produitRepository.save(produit)
    }

    return commandeRepository.save(commande)
  }

  fun mettreEnCoursCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_EN_COURS
    return commandeRepository.save(commande)
  }

  fun mettreEnAttenteCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_EN_ATTENTE
    return commandeRepository.save(commande)
  }

  @Transactional
  fun receptionnerCommande(commandeId: Long, productCmdList: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID: $commandeId") }

    // Vérification de l'état de la commande
    if (commande.etat != Commande.COMMANDE_EN_COURS) {
      throw IllegalStateException("La commande doit être en cours pour être réceptionnée.")
    }

    updateCommande(commande, productCmdList, commandeId)

    // Vérification si la commande est entièrement livrée
    commande.etat = if (commande.qtiteRecu == commande.qtiteCmd) {
      Commande.COMMANDE_LIVREE
    } else {
      Commande.COMMANDE_EN_COURS
    }

    // Sauvegarde de la commande mise à jour
    return commandeRepository.save(commande)
  }

  private fun updateCommande(
    commande: Commande,
    productCmdList: List<ProduitCmdRequest>?,
    commandeId: Long
  ) {
    var totalQuantiteRecu = commande.qtiteRecu ?: 0
    var totalMontantRecu = commande.montantRecu ?: 0.0

    // Parcourir les produits commandés
    val pair = updateProduitStockAndRayon(productCmdList, commandeId, commande, totalQuantiteRecu, totalMontantRecu)
    totalMontantRecu = pair.first
    totalQuantiteRecu = pair.second

    // Mise à jour des quantités et montants
    commande.qtiteRecu = totalQuantiteRecu
    commande.montantRecu = totalMontantRecu
  }

  private fun updateProduitStockAndRayon(
    productCmdList: List<ProduitCmdRequest>?,
    commandeId: Long,
    commande: Commande,
    totalQuantiteRecu: Int,
    totalMontantRecu: Double
  ): Pair<Double, Int> {
    var totalQuantiteRecu1 = totalQuantiteRecu
    var totalMontantRecu1 = totalMontantRecu
    for (produitCmd in productCmdList!!) {
      var produitCmdEntity = produitCmdRepository.findByCommandeIdAndId(produitCmd.id, commandeId.toInt())

      // Vérifier si la quantité commandée est atteinte
      val quantiteRestante = (commande.qtiteCmd ?: 0) - totalQuantiteRecu1
      if (quantiteRestante <= 0) break

      // Ajouter la quantité reçue pour ce produit
      val quantiteARecevoir = minOf(produitCmd.quantite, quantiteRestante)
      totalQuantiteRecu1 += quantiteARecevoir
      totalMontantRecu1 += quantiteARecevoir * produitCmd.prixUnitaire

      if (produitCmdEntity != null) {
        produitCmdEntity.qtiteRecu = produitCmdEntity.qtiteRecu?.plus(quantiteARecevoir) ?: quantiteARecevoir
        produitCmdEntity = produitCmdRepository.save(produitCmdEntity)
      } else {
        val newProduitCmd = ProduitCmd().apply {
          this.produit = produitRepository.findById(produitCmd.productId.toInt())
            .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
          this.qtiteRecu = quantiteARecevoir
          this.puRecept = produitCmd.prixUnitaire
          this.commande = commande
        }
        produitCmdEntity = produitCmdRepository.save(newProduitCmd)
      }

      val enRayon = EnRayon().apply {
        this.produit = produitCmdEntity.produit
        this.rayon = null // Assigner le rayon si nécessaire
        this.fournisseur = commande.fournisseur
        this.unite = null // Assigner l'unité si nécessaire
        this.commande = commande
        this.dateLivraison = commande.dateLivraison ?: LocalDateTime.now()
        this.datePeremption = produitCmd.datePeremption?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
//        this.datePeremption = commande.dateLivraison?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
        this.prixAchat = if (produitCmdEntity.puRecept == null || produitCmdEntity.puRecept == 0.0) {
          produitCmdEntity.produit?.prixAchat?.toInt() ?: 0
        } else {
          produitCmdEntity.puRecept!!.toInt()
        }
        this.prixVente = if (produitCmdEntity.prixPublic == null || produitCmdEntity.prixPublic == 0.0) {
          produitCmdEntity.produit?.prixVente?.toInt() ?: 0
        } else {
          produitCmdEntity.prixPublic!!.toInt()
        }
        this.reduction = 0
        this.quantite = quantiteARecevoir
        this.quantiteRestante = quantiteARecevoir
        this.supprimer = 0
      }

      enRayonRepository.save(enRayon)

      val produit = produitRepository.findById(produitCmd.productId.toInt())
        .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }

      produit.stock = produit.stock?.plus(quantiteARecevoir)
      produitRepository.save(produit)
    }
    return Pair(totalMontantRecu1, totalQuantiteRecu1)
  }

  @Transactional
  fun receptionnerCommandeComplet(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_LIVREE
    commande.dateLivraison = LocalDateTime.now()
    updateCommande(commande, null, commandeId)
    return commandeRepository.save(commande)
  }

  @Transactional
  fun receptionnerCommandePartiel(commandeId: Long, productCmdList: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    updateCommande(commande, null, commandeId)
    return commandeRepository.save(commande)
  }

  fun getAllCommandesMapped(): List<Map<String, Any?>> {
    return commandeRepository.findAll().map { commande ->
      mapOf(
        "id" to commande.id,
        "dateCreation" to commande.dateCreation,
        "etat" to commande.etat,
        "qtiteCmd" to commande.qtiteCmd,
        "montantCmd" to commande.montantCmd
      )
    }
  }

  fun getCommandeById(commandeId: Long): Map<String, Any?> {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    val produits = produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      mapOf(
        "produitId" to (produitCmd.produit?.id as? Long ?: 0L),
        "quantite" to (produitCmd.qtiteRecu ?: 0),
        "prixUnitaire" to (produitCmd.puRecept ?: 0.0)
      )
    }

    return mapOf(
      "id" to commande.id,
      "dateCreation" to commande.dateCreation.toString(),
      "dateLivraison" to commande.dateLivraison?.toString(),
      "fournisseurId" to commande.fournisseur?.id,
      "produits" to produits,
      "montantTotal" to commande.montantCmd,
      "etat" to commande.etat,
      "note" to commande.note
    )
  }
}
