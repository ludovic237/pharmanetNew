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

    val quantiteTotale = request.produits.sumOf { it.quantite!! }
    val montantTotal = request.produits.sumOf { it.quantite!! * it.prixAchat!! }

    val commande = Commande().apply {
      this.employe = employeRepository.findById(request.employeId.toInt())
        .orElseThrow { IllegalArgumentException("Employé non trouvé avec l'ID fourni.") }
      this.fournisseur = fournisseurRepository.findById(request.fournisseurId.toInt())
        .orElseThrow { IllegalArgumentException("Fournisseur non trouvé avec l'ID fourni.") }
      this.dateCreation = LocalDateTime.now()
      this.dateLivraison = when (request.type.lowercase()) {
        "en_attente" -> null
        "en_cours" -> null
        "livree" -> LocalDateTime.now()
        "annulee" -> null
        else -> throw IllegalArgumentException("Type de commande invalide: ${request.type}")
      }
      this.qtiteCmd = quantiteTotale
      this.montantCmd = montantTotal
      this.etat = when (request.type.lowercase()) {
        "en_attente" -> Commande.COMMANDE_EN_ATTENTE
        "en_cours" -> Commande.COMMANDE_EN_COURS
        "livree" -> Commande.COMMANDE_LIVREE
//        "cloture" -> Commande.COMMANDE_CLOTURE
        "annulee" -> Commande.COMMANDE_ANNULER
        else -> throw IllegalArgumentException("Type de commande invalide: ${request.type}")
      }
      this.supprimer = 0
    }
    commande.montantRecu = 0.0
    commande.uniteGratuite = 0
    commande.qtiteCmd = quantiteTotale
    commande.qtiteRecu = 0
    var savedCommande = commandeRepository.save(commande)

    // Ajout des produits dans la table ProduitCommande
    request.produits.forEach { produitRequest ->
      var produitCommande = ProduitCmd().apply {
        this.commande = savedCommande
        this.produit = produitRepository.findById(produitRequest.id!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID fourni.") }
        this.puRecept = when (request.type.lowercase()) {
          "livree" -> produitRequest.prixUnitaire
          "cloture" -> produitRequest.prixUnitaire
          else -> 0.0
        }
        this.puCmd = 0.0
        this.qtiteRecu = when (request.type.lowercase()) {
          "livree" -> produitRequest.quantite
          "cloture" -> produitRequest.quantite
          else -> 0
        }
        this.qtiteCmd = produitRequest.quantite
        this.prixAchat = produitRequest.prixAchat
        this.prixVente = produitRequest.prixVente
        this.uniteGratuite = 0
      }

      produitCommande = produitCmdRepository.save(produitCommande)
      commande.qtiteCmd = request.produits.sumOf { it.quantite!! }
      if (request.type.lowercase() == Commande.COMMANDE_LIVREE.lowercase()) {
        commande.qtiteRecu = request.produits.sumOf { it.quantite!! }
        updateRayonFromCommande(produitCommande, commande, produitRequest, produitRequest.quantite!!)
      }
    }
    if (request.type.lowercase() == Commande.COMMANDE_LIVREE.lowercase()) {
      savedCommande.montantRecu = savedCommande.montantCmd
      savedCommande.qtiteRecu = savedCommande.qtiteCmd
      savedCommande = commandeRepository.save(savedCommande)
    }
    return savedCommande
  }

  fun annulerCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_ANNULER
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
  fun receptionnerCommande(commandeId: Long, receptionType: String, productCmdList: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID: $commandeId") }
    if (commande.etat == Commande.COMMANDE_EN_COURS || commande.etat == Commande.COMMANDE_EN_ATTENTE) {
      when (receptionType.lowercase()) {
        Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.toLowerCase() -> handleCompleteReception(commande, productCmdList)
        Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.toLowerCase() -> handlePartialReception(commande, productCmdList)
        Commande.COMMANDE_RECEPTION_TYPE_ANNULER.toLowerCase() -> handleCancellation(commande)
        else -> throw IllegalArgumentException("Type de réception invalide: $receptionType")
      }
    }
    else if (commande.etat == Commande.COMMANDE_LIVREE ||
      commande.etat == Commande.COMMANDE_EN_COURS ||
      commande.etat == Commande.COMMANDE_EN_ATTENTE) {
      handleCancellation(commande)
    }
    else {
      throw IllegalArgumentException("La commande doit être en cours ou en attente pour la réception.")
    }
    return commandeRepository.save(commande)
  }

  private fun handleCompleteReception(commande: Commande, productCmdList: List<ProduitCmdRequest>) {
    commande.etat = Commande.COMMANDE_LIVREE
    commande.dateLivraison = LocalDateTime.now()
    updateCommande(Commande.COMMANDE_RECEPTION_TYPE_COMPLETE, commande, productCmdList)
  }

  private fun handlePartialReception(commande: Commande, productCmdList: List<ProduitCmdRequest>) {
    updateCommande(Commande.COMMANDE_RECEPTION_TYPE_PARTIEL, commande, productCmdList)
  }

  private fun handleCancellation(commande: Commande) {
    commande.etat = Commande.COMMANDE_ANNULER
  }

  private fun updateCommande(
    receptionType: String,
    commande: Commande,
    productCmdList: List<ProduitCmdRequest>?
  ) {
    val (totalMontantRecu, totalQuantiteRecu) = updateProduitStockAndRayon(receptionType, productCmdList, commande)
    commande.qtiteRecu = totalQuantiteRecu
    commande.montantRecu = totalMontantRecu
  }

  private fun updateProduitStockAndRayon(
    receptionType: String,
    productCmdList: List<ProduitCmdRequest>?,
    commande: Commande
  ): Pair<Double, Int> {
    var totalQuantiteRecu = commande.qtiteRecu ?: 0
    var totalMontantRecu = commande.montantRecu ?: 0.0
    if (receptionType == Commande.COMMANDE_RECEPTION_TYPE_COMPLETE) {
      productCmdList?.forEach { produitCmd ->
        var produitCmdData = produitCmdRepository.findById(produitCmd.id!!.toInt()).get()
        val produit = produitRepository.findById(produitCmd.productId!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
        produitCmdData.qtiteRecu = produitCmdData.qtiteCmd ?: 0

        val quantiteARecevoir = minOf(produitCmdData.qtiteCmd!!, (commande.qtiteCmd ?: 0) - totalQuantiteRecu)
        totalQuantiteRecu += quantiteARecevoir
        totalMontantRecu += quantiteARecevoir * produitCmdData.prixAchat!!

        produitCmdData.qtiteRecu = produitCmdData.qtiteCmd
        produitCmdRepository.save(produitCmdData)

        updateRayonFromCommande(produitCmdData, commande, produitCmd, produitCmdData.qtiteRecu!!.toInt())
        updateProduitStock(produitCmd.productId.toLong(), produitCmdData.qtiteRecu!!)
      }
      commande.montantRecu = totalMontantRecu
      commande.montantCmd = totalMontantRecu
    }
    else if (receptionType.toLowerCase() == Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.toLowerCase()) {
      totalQuantiteRecu = 0
      totalMontantRecu = 0.0
      productCmdList?.forEach { produitCmd ->
        val produitCmdEntity = produitCmdRepository.findById(produitCmd.id!!.toInt()).get()
          ?: createNewProduitCmd(produitCmd, commande)

        produitCmdEntity.qtiteRecu = produitCmdEntity.qtiteRecu?.plus(produitCmd.quantite!!)
        if (produitCmdEntity.qtiteRecu !! > produitCmdEntity.qtiteCmd!!) {
          throw IllegalArgumentException("La quantité à recevoir ne peut pas dépasser la quantité commandée.")
        }
        totalQuantiteRecu += produitCmdEntity.qtiteRecu?.toInt() ?: 0
        totalMontantRecu += produitCmdEntity.qtiteRecu?.toInt()!! * produitCmdEntity.prixAchat!!

        produitCmdRepository.save(produitCmdEntity)

        updateRayonFromCommande(produitCmdEntity, commande, produitCmd, produitCmd.quantite?.toInt() ?: 0)
        updateProduitStock(produitCmd.productId!!, produitCmd.quantite?.toInt() ?: 0)
      }
    }

    commande.qtiteRecu =  produitCmdRepository.findByCommandeId(commande.id!!).sumOf { it.qtiteRecu ?: 0 }
    totalQuantiteRecu = commande.qtiteRecu ?: 0
    if (totalQuantiteRecu == commande.qtiteCmd) {
      commande.etat = Commande.COMMANDE_LIVREE
      commande.dateLivraison = LocalDateTime.now()
      commande.montantRecu = totalMontantRecu
      commande.montantCmd = totalMontantRecu
    } else if (receptionType.lowercase() == Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.toLowerCase()) {
      commande.dateLivraison = LocalDateTime.now()
      commande.qtiteCmd = totalQuantiteRecu
      commande.montantRecu = totalMontantRecu
      commande.montantCmd = totalMontantRecu
    }
    updateCommandeState(receptionType, commande, totalQuantiteRecu)

    commandeRepository.save(commande);
    return Pair(totalMontantRecu, totalQuantiteRecu)
  }

  private fun createNewProduitCmd(produitCmd: ProduitCmdRequest, commande: Commande): ProduitCmd {
    return ProduitCmd().apply {
      this.produit = produitRepository.findById(produitCmd.productId!!.toInt())
        .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
      this.qtiteRecu = produitCmd.quantite
      this.puRecept = produitCmd.prixUnitaire
      this.commande = commande
    }.let { produitCmdRepository.save(it) }
  }

  private fun updateRayonFromCommande(
    produitCmdEntity: ProduitCmd,
    commande: Commande,
    produitCmd: ProduitCmdRequest,
    quantiteARecevoir: Int
  ) {
    if (quantiteARecevoir <= 0) return

    val produit = produitRepository.findById(produitCmd.productId!!.toInt())
      .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
    if (enRayonRepository.findByProduitAndCommandeAndSupprimer(produit, commande, 0).isPresent) {
      // Si le produit est déjà en rayon pour cette commande, on met à jour la quantité
      val enRayon = enRayonRepository.findByProduitAndCommandeAndSupprimer(produit, commande, 0).get()
      enRayon.quantite = enRayon.quantite!! + quantiteARecevoir
      enRayon.quantiteRestante = enRayon.quantiteRestante!! + quantiteARecevoir
      enRayonRepository.save(enRayon)
    } else {
      val enRayon = EnRayon().apply {
        this.produit = produitCmdEntity.produit
        this.commande = commande
        this.reduction = 0
        this.fournisseur = commande.fournisseur
        this.dateLivraison = commande.dateLivraison ?: LocalDateTime.now()
        this.datePeremption = produitCmd.datePeremption?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
        this.prixAchat = produitCmdEntity.prixAchat?.toInt() ?: produitCmdEntity.produit?.prixAchat?.toInt() ?: 0
        this.prixVente = produitCmdEntity.prixVente?.toInt() ?: produitCmdEntity.produit?.prixVente?.toInt() ?: 0
        this.quantite = quantiteARecevoir
        this.quantiteRestante = quantiteARecevoir
      }
      enRayonRepository.save(enRayon)
    }

  }

  private fun updateProduitStock(productId: Long, quantiteARecevoir: Int) {
    val produit = produitRepository.findById(productId.toInt())
      .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: $productId") }
    produit.stock = produit.stock?.plus(quantiteARecevoir)
    produitRepository.save(produit)
  }

  private fun updateCommandeState(receptionType: String, commande: Commande, totalQuantiteRecu: Int) {
    when (receptionType.lowercase()) {
      Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.toLowerCase() -> commande.etat = Commande.COMMANDE_LIVREE
      Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.toLowerCase() -> commande.etat =
        if (totalQuantiteRecu == commande.qtiteCmd) {
          Commande.COMMANDE_LIVREE
        } else {
          Commande.COMMANDE_EN_COURS
        }
    }
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
