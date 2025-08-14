package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.models.Commande
import com.example.backend.models.EnRayon
import com.example.backend.models.ProduitCmd
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.element.Table
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.File
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class CommandeService(
  private val employeRepository: EmployeRepository,
  private val produitCmdRepository: ProduitCmdRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val commandeRepository: CommandeRepository,
  private val produitRepository: ProduitRepository,
  private val enRayonRepository: EnRayonRepository,
  private val userRepository: UserRepository,
  private val userUtils: UserUtils
) {

  @Transactional
  fun commandeByFournisseur(fournisseurId: String?, totalAmount: String?, request: List<CommandeNewDTO>): Commande {

    var getCurrentEmploye = userUtils.getCurrentEmploye()
    val currentUser = userUtils.getCurrentEmployeId()

    var quantiteTotal = 0
    var montantTotal = 0
    request.forEach { r ->
      quantiteTotal += r?.quantiteRestante!!
      montantTotal += (r?.quantiteRestante!! * r?.prixAchat!!)
    }

    val commande = Commande().apply {
      this.employeId = getCurrentEmploye!!.id
      var newFournisseurId: String? = fournisseurId
      if (fournisseurId == "null") {
        newFournisseurId = "0"
      }
      this.fournisseur = fournisseurRepository.findById(newFournisseurId!!.toInt())
        .orElseThrow { IllegalArgumentException("Fournisseur non trouvé avec l'ID fourni.") }
      this.dateCreation = LocalDateTime.now()
      this.dateLivraison = LocalDateTime.now()
      this.ref = genererReferenceCommande(commandeRepository.countMois().toInt())
      this.qtiteCmd = quantiteTotal
      this.montantCmd = montantTotal!!.toDouble()
      this.etat = "livree"
      this.supprimer = 0
    }
    commande.montantRecu = montantTotal.toDouble() ?: 0.0
    commande.uniteGratuite = 0
    commande.qtiteRecu = quantiteTotal ?: 0

    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    commande.id = formattedDateTimeNow.toLong()
    var savedCommande = commandeRepository.save(commande)

    // Ajout des produits dans la table ProduitCommande
    request.forEach { produitRequest ->
      var produitCommande = ProduitCmd().apply {
        this.commandeId = savedCommande.id
        this.produit = produitRepository.findById(produitRequest.id!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID fourni.") }
        this.puRecept = produitRequest.prixAchat?.toDouble() ?: 0.0

        this.puCmd = 0.0
        this.qtiteRecu = produitRequest.quantiteRestante ?: 0
        this.qtiteCmd = produitRequest.quantiteRestante ?: 0
        this.qtiteRecu = produitRequest.quantiteRestante ?: 0
        this.puCmd = produitRequest.prixAchat?.toDouble() ?: 0.0
        this.prixPublic = produitRequest.prixAchat?.toDouble() ?: 0.0
        this.uniteGratuite = 0

      }

      produitCommande = produitCmdRepository.save(produitCommande)

      updateRayonFromCommandeSimple(
        produitCommande,
        savedCommande,
        produitRequest,
        produitRequest.quantiteRestante!!
      )
    }
    return savedCommande
  }

  @Transactional
  fun createCommande(request: CommandeRequest): Commande {
    if (request.produits.isEmpty()) {
      throw IllegalArgumentException("La commande doit contenir au moins un produit.")
    }

    val quantiteTotale = request.produits.sumOf { it.quantite!! }
    val quantiteTotaleRecu = request.produits.sumOf { it.quantiteRecu!! }
    val quantiteTotaleUniteGratuite = request.produits.sumOf { it.uniteGratuite!! }
    val montantTotal = request.produits.sumOf { it.quantite!! * it.prixAchat!! }
    val montantTotalRecu = request.produits.sumOf { it.quantiteRecu!! * it.prixAchat!! }

    val commande = Commande().apply {
      this.employeId = request.employeId.toInt()
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
      this.ref = genererReferenceCommande(commandeRepository.countMois().toInt())
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
    commande.montantRecu = montantTotalRecu ?: 0.0
    commande.uniteGratuite = quantiteTotaleUniteGratuite
    commande.qtiteCmd = quantiteTotale
    commande.qtiteRecu = quantiteTotaleRecu ?: 0
    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    commande.id = formattedDateTimeNow.toLong()
    var savedCommande = commandeRepository.save(commande)

    // Ajout des produits dans la table ProduitCommande
    request.produits.forEach { produitRequest ->
      var produitCommande = ProduitCmd().apply {
        this.commandeId = savedCommande.id
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
        this.qtiteCmd = produitRequest.quantite ?: 0
        this.qtiteRecu = produitRequest.quantiteRecu ?: 0
        this.puCmd = produitRequest.prixAchat ?: 0.0
        this.prixPublic = produitRequest.prixVente ?: 0.0
        this.uniteGratuite = produitRequest.uniteGratuite ?: 0
      }


      produitCommande = produitCmdRepository.save(produitCommande)
      produitRequest.productCmdId = produitCommande.id?.toLong()
      produitRequest.productId = produitRequest.id?.toLong()

      savedCommande.qtiteCmd = request.produits.sumOf { it.quantite!! }
      if (request.type.lowercase() === Commande.COMMANDE_LIVREE.lowercase()) {
        savedCommande.qtiteRecu = request.produits.sumOf { it.quantite!! }
        savedCommande = commandeRepository.save(savedCommande)
        updateRayonFromCommande(
          produitCommande,
          savedCommande,
          produitRequest,
          (produitRequest.quantite!! + produitRequest.uniteGratuite!! ?: 0)
        )
      } else {
        savedCommande.qtiteRecu = request.produits.sumOf { it.quantiteRecu!! }
        savedCommande = commandeRepository.save(savedCommande)
        if ((produitRequest.quantiteRecu!! + produitRequest.uniteGratuite!! ?: 0) > 0) {
          updateRayonFromCommande(
            produitCommande,
            savedCommande,
            produitRequest,
            (produitRequest.quantiteRecu!! + produitRequest.uniteGratuite!! ?: 0)
          )
        }
      }

    }
    if (request.type.lowercase() == Commande.COMMANDE_EN_COURS.lowercase()) {
      savedCommande.montantRecu = savedCommande.montantCmd
      savedCommande.qtiteRecu = savedCommande.qtiteRecu
      savedCommande.uniteGratuite = savedCommande.uniteGratuite
      savedCommande = commandeRepository.save(savedCommande)
    }
    if (request.type.lowercase() == Commande.COMMANDE_LIVREE.lowercase()) {
      savedCommande.montantRecu = savedCommande.montantCmd
      savedCommande.qtiteRecu = savedCommande.qtiteCmd
      savedCommande.uniteGratuite = savedCommande.uniteGratuite
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


  @Transactional
  fun receptionnerCommande(commandeId: Long, receptionType: String, productCmdList: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID: $commandeId") }
    if (commande.etat == Commande.COMMANDE_EN_COURS || commande.etat == Commande.COMMANDE_EN_ATTENTE) {
      when (receptionType.lowercase()) {
        Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.lowercase() -> handleCompleteReception(commande, productCmdList)
        Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.lowercase() -> handlePartialReception(commande, productCmdList)
        Commande.COMMANDE_RECEPTION_TYPE_ANNULER.lowercase() -> handleCancellation(commande)
        else -> throw IllegalArgumentException("Type de réception invalide: $receptionType")
      }
    } else if (commande.etat == Commande.COMMANDE_LIVREE ||
      commande.etat == Commande.COMMANDE_EN_COURS ||
      commande.etat == Commande.COMMANDE_EN_ATTENTE
    ) {
      handleCancellation(commande)
    } else {
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
    val totalUniteGratuite = productCmdList?.sumOf { it.uniteGratuite ?: 0 } ?: 0
    var totalMontantRecu = commande.montantRecu ?: 0.0
    if (receptionType == Commande.COMMANDE_RECEPTION_TYPE_COMPLETE) {
      productCmdList?.forEach { produitCmd ->
        var produitCmdData = produitCmdRepository.findById(produitCmd.id!!.toInt()).get()
        val produit = produitRepository.findById(produitCmd.productId!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
        produitCmdData.qtiteRecu = produitCmdData.qtiteCmd ?: 0

        val quantiteARecevoir = minOf(produitCmdData.qtiteCmd!!, (commande.qtiteCmd ?: 0) - totalQuantiteRecu)
        totalQuantiteRecu += quantiteARecevoir
        totalMontantRecu += quantiteARecevoir * produitCmdData.puCmd!!

        produitCmdData.qtiteRecu = produitCmdData.qtiteCmd
        produitCmdRepository.save(produitCmdData)

        updateRayonFromCommande(produitCmdData, commande, produitCmd, produitCmdData.qtiteRecu!!.toInt())
        updateProduitStock(produitCmd.productId!!.toLong(), produitCmdData.qtiteRecu!!)
      }
      commande.montantRecu = totalMontantRecu
      commande.montantCmd = totalMontantRecu
    } else if (receptionType.lowercase() == Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.lowercase()) {
      totalQuantiteRecu = 0
      totalMontantRecu = 0.0
      productCmdList?.forEach { produitCmd ->
        var produit = produitRepository.findById(produitCmd.productId!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.productId}") }
        val produitCmdEntity = produitCmdRepository.findByCommandeIdAndProduit(commande.id!!.toLong(), produit)
          ?: createNewProduitCmd(produitCmd, commande)
        produitCmdEntity.uniteGratuite = produitCmdEntity.uniteGratuite ?: 0 + produitCmd.uniteGratuite!! ?: 0
        produitCmdEntity.qtiteRecu = produitCmdEntity.qtiteRecu?.plus(produitCmd.quantite!!)
        if (produitCmdEntity.qtiteRecu!! > produitCmdEntity.qtiteCmd!!) {
          throw IllegalArgumentException("La quantité à recevoir ne peut pas dépasser la quantité commandée.")
        }

        totalQuantiteRecu = produitCmdEntity.qtiteRecu?.toInt() ?: 0 + produitCmd.quantite?.toInt()!! ?: 0
        totalMontantRecu += produitCmdEntity.qtiteRecu?.toInt()!! * produitCmdEntity.puCmd!!

        produitCmdRepository.save(produitCmdEntity)

        updateRayonFromCommande(
          produitCmdEntity, commande, produitCmd, produitCmd.quantite!! + produitCmd.uniteGratuite?.toInt()!!
            ?: 0
        )
        updateProduitStock(produitCmd.productId!!, produitCmd.quantite!! + produitCmd.uniteGratuite?.toInt()!! ?: 0)
      }
    }
    commande.uniteGratuite = commande.uniteGratuite!! + totalUniteGratuite
    commande.qtiteRecu = produitCmdRepository.findByCommandeId(commande.id!!).sumOf { it.qtiteRecu ?: 0 }
    totalQuantiteRecu = (commande.qtiteRecu ?: 0) + (totalUniteGratuite ?: 0)
    if (totalQuantiteRecu == commande.qtiteCmd) {
      commande.etat = Commande.COMMANDE_LIVREE
      commande.dateLivraison = LocalDateTime.now()
      commande.montantRecu = totalMontantRecu
      commande.montantCmd = totalMontantRecu
    } else if (receptionType.lowercase() == Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.lowercase()) {
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
      this.commandeId = commande.id
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
    updateProduitStock(produit?.id!!.toLong(), quantiteARecevoir)
    if (enRayonRepository.findByProduitIdAndCommandeAndSupprimer(produit.id!!, commande, 0).isPresent) {
      // Si le produit est déjà en rayon pour cette commande, on met à jour la quantité
      val enRayon = enRayonRepository.findByProduitIdAndCommandeAndSupprimer(produit.id!!, commande, 0).get()
      enRayon.quantite = enRayon.quantite!! + quantiteARecevoir
      enRayon.quantiteRestante = enRayon.quantiteRestante!! + quantiteARecevoir
      enRayonRepository.save(enRayon)
    } else {
      val enRayon = EnRayon().apply {
        this.produitId = produitCmdEntity.produit!!.id
        this.commande = commande
        this.reduction = 0
        this.fournisseur = commande.fournisseur
        this.dateLivraison = commande.dateLivraison ?: LocalDateTime.now()
        this.datePeremption = produitCmd.dateDePeremption ?: LocalDateTime.now().plusDays(30)
//        this.datePeremption = produitCmd.datePeremption?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
        this.prixAchat = produitCmdEntity.puCmd?.toInt() ?: 0
        this.prixVente = produitCmdEntity.prixPublic?.toInt() ?: 0
        this.quantite = quantiteARecevoir
        this.quantiteRestante = quantiteARecevoir
      }
      enRayonRepository.save(enRayon)
    }

  }

  private fun updateRayonFromCommandeSimple(
    produitCmdEntity: ProduitCmd,
    commande: Commande,
    produitCmd: CommandeNewDTO,
    quantiteARecevoir: Int
  ) {
    if (quantiteARecevoir <= 0) return

    val produit = produitRepository.findById(produitCmd.id!!.toInt())
      .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID: ${produitCmd.id}") }
    updateProduitStock(produit?.id!!.toLong(), quantiteARecevoir)
    if (enRayonRepository.findByProduitIdAndCommandeAndSupprimer(produit.id!!, commande, 0).isPresent) {
      // Si le produit est déjà en rayon pour cette commande, on met à jour la quantité
      val enRayon = enRayonRepository.findByProduitIdAndCommandeAndSupprimer(produit.id!!, commande, 0).get()
      enRayon.quantite = enRayon.quantite!! + quantiteARecevoir
      enRayon.quantiteRestante = enRayon.quantiteRestante!! + quantiteARecevoir
      enRayonRepository.save(enRayon)
    } else {
      val dateTimeNow = LocalDateTime.now()
      val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
      val formattedDateTimeNow = dateTimeNow.format(formatter)
      val enRayon = EnRayon().apply {
        this.id = formattedDateTimeNow
        this.produitId = produitCmdEntity.produit!!.id
        this.commande = commande
        this.reduction = 0
        this.fournisseur = commande.fournisseur
        this.dateLivraison = commande.dateLivraison ?: LocalDateTime.now()
        this.datePeremption =
          LocalDateTime.parse(produitCmd.datePeremption!!.trim()) ?: LocalDateTime.now().plusDays(30)
//        this.datePeremption = produitCmd.datePeremption?.plusDays(30) ?: LocalDateTime.now().plusDays(30)
        this.prixAchat = produitCmdEntity.puCmd?.toInt() ?: 0
        this.prixVente = produitCmdEntity.prixPublic?.toInt() ?: 0
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
      Commande.COMMANDE_RECEPTION_TYPE_COMPLETE.lowercase() -> commande.etat = Commande.COMMANDE_LIVREE
      Commande.COMMANDE_RECEPTION_TYPE_PARTIEL.lowercase() -> commande.etat =
        if (totalQuantiteRecu == commande.qtiteCmd) {
          Commande.COMMANDE_LIVREE
        } else {
          Commande.COMMANDE_EN_COURS
        }
    }
  }


  fun getAllCommandesMapped(): List<Map<String, Any?>> {
    return commandeRepository.findAll()
      .sortedByDescending { it.dateCreation }
      .map { commande ->
        mapOf(
          "id" to commande.id,
          "ref" to commande.ref,
          "dateCreation" to commande.dateCreation,
          "etat" to commande.etat,
          "qtiteCmd" to commande.qtiteCmd,
          "qtiteRecu" to commande.qtiteRecu,
          "montantRecu" to commande.montantRecu,
          "uniteGratuite" to commande.uniteGratuite,
          "fournisseur" to commande.fournisseur!!.nom,
          "montantCmd" to commande.montantCmd
        )
      }
  }

  fun getAllCommandesMappedPageable(
    pageable: Pageable,
    etat: String?,
    fournisseurId: String?,
    typeFournisseur: String?,
    startDate: String?,
    endDate: String?
  ): CommandePageableCustomlDto {
    val specification = CommandeRepository.filterCommandes(etat, typeFournisseur, fournisseurId, startDate, endDate)
    val commandes = commandeRepository.findAll(specification, pageable)
      .map { commande ->
        mapOf(
          "id" to commande.id as Any?,
          "ref" to commande.ref as Any?,
          "dateCreation" to commande.dateCreation as Any?,
          "etat" to commande.etat as Any?,
          "qtiteCmd" to commande.qtiteCmd as Any?,
          "qtiteRecu" to commande.qtiteRecu as Any?,
          "montantRecu" to commande.montantRecu as Any?,
          "uniteGratuite" to commande.uniteGratuite as Any?,
          "fournisseur" to commande.fournisseur!!.nom as Any?,
          "montantCmd" to commande.montantCmd as Any?
        )
      }
    var totalAmountRecu = 0.0
    var totalAmountCommande = 0.0
    var totalQteRecu = 0
    var totalQteCommande = 0
    if (commandes.totalElements > 0) {
      val pageableElement =
        PageRequest.of(0, commandes.totalElements.toInt(), Sort.by(Sort.Direction.DESC, "dateCreation"))
      val venteTotal = commandeRepository.findAll(specification, pageableElement)
      totalAmountRecu = venteTotal.content.sumOf { it.montantRecu as Double }
      totalAmountCommande = venteTotal.content.sumOf { it.montantCmd as Double }
      totalQteRecu = venteTotal.content.sumOf { it.qtiteRecu as Int }
      totalQteCommande = venteTotal.content.sumOf { it.qtiteCmd as Int }
    }

    val data = CommandePageableCustomlDto(
      content = commandes,
      totalElements = commandes.totalElements,
      totalPages = commandes.totalPages,
      pageSize = commandes.size,
      pageNumber = commandes.number,
      totalAmountRecu = totalAmountRecu,
      totalAmountCommande = totalAmountCommande,
      totalQteRecu = totalQteRecu,
      totalQteCommande = totalQteCommande,
    )

    return data
  }

  fun getCommandeById(commandeId: Long): Map<String, Any?> {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    val produits = produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      mapOf(
        "produit" to (produitCmd.produit),
        "prixAchat" to (produitCmd.puCmd ?: 0),
        "prixVente" to (produitCmd.prixPublic ?: 0),
        "qtiteRecu" to (produitCmd.qtiteRecu ?: 0),
        "uniteGratuite" to (produitCmd.uniteGratuite ?: 0),
        "qtiteCmd" to (produitCmd.qtiteCmd ?: 0),
        "prixUnitaire" to (produitCmd.puRecept ?: 0.0)
      )

    }

    return mapOf(
      "id" to commande.id,
      "dateCreation" to commande.dateCreation.toString(),
      "dateLivraison" to commande.dateLivraison?.toString(),
      "fournisseur" to commande.fournisseur,
      "produits" to produits,
      "reference" to commande.ref,
      "etat" to commande.etat,
      "montantTotal" to commande.montantCmd,
      "qtiteRecu" to commande.qtiteRecu,
      "qtiteCmd" to commande.qtiteCmd,
      "uniteGratuite" to commande.uniteGratuite,
      "etat" to commande.etat,
      "note" to commande.note
    )
  }


  fun genererReferenceCommande(num: Int): String {
    // Get today's date
    val today = LocalDate.now()
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val formattedDate = today.format(formatter)

    // Extract year, month, and day
    val annee = formattedDate.substring(0, 4)
    val mois = formattedDate.substring(5, 7)

    // Increment the number
    var numeroRegBig = num + 1

    // Format the number to always have 4 digits
    val formattedNumeroRegBig = String.format("%04d", numeroRegBig)

    // Generate the reference
    return "ALS$annee${mois}COM$formattedNumeroRegBig"
  }

  fun mettreEnAttenteCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_EN_ATTENTE
    return commandeRepository.save(commande)
  }

  fun mettreEnCoursCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    commande.etat = Commande.COMMANDE_EN_COURS
    return commandeRepository.save(commande)
  }


  @Transactional
  fun modifierLignesCommande(commandeId: Long, produits: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_EN_ATTENTE) {
      throw IllegalStateException("Modification des lignes non autorisée pour les commandes avec l'état: ${commande.etat}")
    }
    produits.forEach { produitRequest ->
      val produitCmd = produitCmdRepository.findByCommandeIdAndProduit(
        commande.id!!.toLong(),
        produitRepository.findById(produitRequest.id!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID fourni.") }
      ) ?: ProduitCmd().apply {
        this.commandeId = commande.id
        this.produit = produitRepository.findById(produitRequest.id!!.toInt()).get()
      }
      produitCmd.qtiteCmd = produitRequest.quantite
      produitCmd.prixPublic = produitRequest.prixAchat
      produitCmdRepository.save(produitCmd)
    }
    return commande
  }

  fun supprimerCommande(commandeId: Long) {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_EN_ATTENTE) {
      throw IllegalStateException("Suppression non autorisée pour les commandes avec l'état: ${commande.etat}")
    }
    commande.supprimer = 1
    commandeRepository.save(commande)
//    commandeRepository.delete(commande)
  }

  fun ajouterFournisseur(commandeId: Long, fournisseurId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_EN_ATTENTE) {
      throw IllegalStateException("Ajout de fournisseur non autorisé pour les commandes avec l'état: ${commande.etat}")
    }
    val fournisseur = fournisseurRepository.findById(fournisseurId.toInt())
      .orElseThrow { IllegalArgumentException("Fournisseur non trouvé avec l'ID fourni.") }
    commande.fournisseur = fournisseur
    return commandeRepository.save(commande)
  }

  fun ajouterJustificatif(commandeId: Long, justificatif: String): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_EN_COURS) {
      throw IllegalStateException("Ajout de justificatif non autorisé pour les commandes avec l'état: ${commande.etat}")
    }
    commande.note = justificatif
    return commandeRepository.save(commande)
  }

  fun cloturerCommande(commandeId: Long): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_LIVREE && commande.etat != Commande.COMMANDE_EN_COURS) {
      throw IllegalStateException("Clôture non autorisée pour les commandes avec l'état: ${commande.etat}")
    }
    commande.etat = Commande.COMMANDE_CLOTUREE
    return commandeRepository.save(commande)
  }

  fun ajouterMotifAnnulation(commandeId: Long, motif: String): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }
    if (commande.etat != Commande.COMMANDE_ANNULER) {
      throw IllegalStateException("Ajout de motif d'annulation non autorisé pour les commandes avec l'état: ${commande.etat}")
    }
    commande.note = motif
    return commandeRepository.save(commande)
  }

  fun imprimerBonPdf(commandeId: Long, outputPath: String) {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_EN_ATTENTE) {
      throw IllegalStateException("Impression du bon non autorisée pour les commandes avec l'état: ${commande.etat}")
    }

    val produits = produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      mapOf(
        "Produit" to produitCmd.produit?.nom,
        "Quantité commandée" to produitCmd.qtiteCmd,
        "Prix unitaire" to produitCmd.prixPublic
      )
    }

    val file = File(outputPath)
    val pdfWriter = PdfWriter(file)
    val pdfDocument = PdfDocument(pdfWriter)
    val document = Document(pdfDocument)

    document.add(Paragraph("Bon de commande").setFontSize(18f).setBold())
    document.add(Paragraph("Référence commande: ${commande.ref}"))
    document.add(Paragraph("Date de création: ${commande.dateCreation}"))
    document.add(Paragraph("Montant total: ${commande.montantCmd}"))
    document.add(Paragraph("\nProduits:"))

    val table = Table(3)
    table.addCell("Produit")
    table.addCell("Quantité commandée")
    table.addCell("Prix unitaire")

    produits.forEach { produit ->
      table.addCell(produit["Produit"].toString())
      table.addCell(produit["Quantité commandée"].toString())
      table.addCell(produit["Prix unitaire"].toString())
    }

    document.add(table)
    document.close()

    println("PDF généré avec succès: ${file.absolutePath}")
  }

  @Transactional
  fun receptionComplementaire(commandeId: Long, produits: List<ProduitCmdRequest>): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_EN_COURS) {
      throw IllegalStateException("Réception complémentaire non autorisée pour les commandes avec l'état: ${commande.etat}")
    }

    produits.forEach { produitRequest ->
      val produitCmd = produitCmdRepository.findByCommandeIdAndProduit(
        commande.id!!.toLong(),
        produitRepository.findById(produitRequest.id!!.toInt())
          .orElseThrow { IllegalArgumentException("Produit non trouvé avec l'ID fourni.") }
      ) ?: throw IllegalArgumentException("Produit non trouvé dans la commande.")

      produitCmd.qtiteRecu = (produitCmd.qtiteRecu ?: 0) + produitRequest.quantite!!
      if (produitCmd.qtiteRecu!! > produitCmd.qtiteCmd!!) {
        throw IllegalArgumentException("La quantité reçue ne peut pas dépasser la quantité commandée.")
      }

      produitCmdRepository.save(produitCmd)

      // Update stock
      val produit = produitCmd.produit!!
      produit.stock = (produit.stock ?: 0) + produitRequest.quantite!!
      produitRepository.save(produit)
    }

    commande.qtiteRecu = produitCmdRepository.findByCommandeId(commande.id!!).sumOf { it.qtiteRecu ?: 0 }
    commande.montantRecu = produitCmdRepository.findByCommandeId(commande.id!!).sumOf {
      (it.qtiteRecu ?: 0) * (it.prixPublic ?: 0.0)
    }

    return commandeRepository.save(commande)
  }

  fun visualiserHistoriqueReception(commandeId: Long): List<Map<String, Any?>> {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_EN_COURS) {
      throw IllegalStateException("Visualisation de l'historique non autorisée pour les commandes avec l'état: ${commande.etat}")
    }

    return produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      mapOf(
        "produit" to produitCmd.produit?.nom,
        "quantiteRecu" to produitCmd.qtiteRecu,
        "dateReception" to commande.dateLivraison
      )
    }
  }

  fun ajouterFacture(commandeId: Long, facture: String): Commande {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_LIVREE) {
      throw IllegalStateException("Ajout de facture non autorisé pour les commandes avec l'état: ${commande.etat}")
    }

    commande.note = facture
    return commandeRepository.save(commande)
  }

  fun genererRapportLivraison(commandeId: Long): String {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_LIVREE) {
      throw IllegalStateException("Génération de rapport non autorisée pour les commandes avec l'état: ${commande.etat}")
    }

    val produits = produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      "Produit: ${produitCmd.produit?.nom}, Quantité reçue: ${produitCmd.qtiteRecu}, Prix unitaire: ${produitCmd.prixPublic}"
    }

    val rapport = """
          Rapport de livraison
          ---------------------
          Référence commande: ${commande.ref}
          Date de livraison: ${commande.dateLivraison}
          Produits:
          ${produits.joinToString("\n")}
          Montant total reçu: ${commande.montantRecu}
      """.trimIndent()

    return rapport
  }

  fun exporterCommande(commandeId: Long): String {
    val commande = commandeRepository.findById(commandeId)
      .orElseThrow { IllegalArgumentException("Commande non trouvée avec l'ID fourni.") }

    if (commande.etat != Commande.COMMANDE_CLOTUREE) {
      throw IllegalStateException("Exportation non autorisée pour les commandes avec l'état: ${commande.etat}")
    }

    val produits = produitCmdRepository.findByCommandeId(commandeId).map { produitCmd ->
      mapOf(
        "Produit" to produitCmd.produit?.nom,
        "Quantité commandée" to produitCmd.qtiteCmd,
        "Quantité reçue" to produitCmd.qtiteRecu,
        "Prix achat" to produitCmd.prixPublic,
        "Prix vente" to produitCmd.puCmd
      )
    }

    val exportData = mapOf(
      "Référence commande" to commande.ref,
      "Date création" to commande.dateCreation,
      "Date clôture" to commande.dateLivraison,
      "Montant total" to commande.montantCmd,
      "Produits" to produits
    )

    // Convert exportData to JSON or CSV format (example: JSON)
    return exportData.toString() // Replace with actual export logic
  }

  fun getCommandeInfoByProduct(
    pageable: Pageable,
    produitId: String?,
    startDate: String?,
    endDate: String?
  ): CommandePageableCustomlDto {
    val produit = produitRepository.findById(produitId!!.toInt()).get()
    val specificationCommande = CommandeRepository.filterCommandes(null, null, null, startDate, endDate)
    val commandes = commandeRepository.findAll(specificationCommande, pageable)
      .map { commande ->
        val commandeProduit = produitCmdRepository.findByCommandeIdAndProduit(commande?.id!!, produit)
        mapOf(
          "commandeId" to commande.id as Any?,
          "commandeReference" to commande.ref as Any?,
          "dateCreation" to commande.dateCreation as Any?,
          "prixAchat" to commandeProduit.puRecept as Any?,
          "prixVente" to commandeProduit.prixPublic as Any?,
          "qteCommande" to commandeProduit.qtiteCmd as Any?,
          "qteRecu" to commandeProduit.qtiteRecu as Any?,
          "qteTotalRecu" to commande.qtiteRecu as Any?,
          "qteTotalCommande" to commande.qtiteCmd as Any?,
          "fournisseur" to commande.fournisseur!!.nom as Any?,
          "etat" to commande.etat as Any?
        )
      }
    var totalAmountRecu = 0.0
    var totalAmountCommande = 0.0
    var totalQteRecu = 0
    var totalQteCommande = 0
    if (commandes.totalElements > 0) {
      val pageableElement =
        PageRequest.of(0, commandes.totalElements.toInt(), Sort.by(Sort.Direction.DESC, "dateCreation"))
      val commandeTotal = commandeRepository.findAll(specificationCommande, pageableElement)
      totalAmountRecu = commandeTotal.content.sumOf { it.montantRecu as Double }
      totalAmountCommande = commandeTotal.content.sumOf { it.montantCmd as Double }
      totalQteRecu = commandeTotal.content.sumOf { it.qtiteRecu as Int }
      totalQteCommande = commandeTotal.content.sumOf { it.qtiteCmd as Int }
    }
    val data = CommandePageableCustomlDto(
      content = commandes,
      totalElements = commandes.totalElements,
      totalPages = commandes.totalPages,
      pageSize = commandes.size,
      pageNumber = commandes.number,
      totalAmountRecu = totalAmountRecu,
      totalAmountCommande = totalAmountCommande,
      totalQteRecu = totalQteRecu,
      totalQteCommande = totalQteCommande,
    )
    return data
  }
}
