package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.exceptions.NotFoundException
import com.example.backend.exceptions.ValidationException
import com.example.backend.models.*
import com.example.backend.models.Produit
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime

@Service
class ProduitService(
  private val userUtils: UserUtils,
  private val retourProduitRepository: RetourProduitRepository,
  private val produitRetourRepository: ProduitRetourRepository,
  private val produitCmdRepository: ProduitCmdRepository,
  private val produitDetailRepository: ProduitDetailRepository,
  private val employeRepository: EmployeRepository,
  private val concernerRepository: ConcernerRepository,
  private val venteRepository: VenteRepository,
  private val produitRepository: ProduitRepository,
  private val categorieRepository: CategorieRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val rayonRepository: RayonRepository,
  private val enRayonRepository: EnRayonRepository,
  private val formeRepository: FormeRepository,
  private val magasinRepository: MagasinRepository,
  private val fabriquantRepository: FabriquantRepository,
  private val caisseRepository: CaisseRepository,
  private val commandeRepository: CommandeRepository,
  private  val caisseService: CaisseService
) {

  @Transactional
  fun createProduit(request: ProduitRequestDto): ProduitResponseDto {
    request.codebarre?.let {
      if (produitRepository.findByCodeUbipharmAndSupprimer(it).isPresent) {
        throw ValidationException("Un produit avec le code-barres '${it}' existe déjà.")
      }
    }

    var categorie = request.categorie
    var fournisseur = request.fournisseur

    val prixAchat = request.prixAchat ?: BigDecimal.ZERO
    val marge = request.margeBeneficiaire ?: BigDecimal.ZERO
    val tvaRate = request.tva ?: BigDecimal.ZERO // e.g., 0.20

    // Calcul du prix de vente conseillé: PrixAchat * (1 + Marge) * (1 + TVA)
    // Ou si TVA est incluse dans la marge: PrixAchat * (1 + Marge + (Marge*TVA))
    // Pour simplifier : (PrixAchat / (1 - Marge)) * (1 + TVA) si marge est sur prix de vente
    // Ici, on suppose que la marge s'applique sur le prix d'achat HT, puis on ajoute la TVA
    val prixVenteConseilleHT = prixAchat.multiply(BigDecimal.ONE.add(marge))
    val prixVenteConseilleTTC = prixVenteConseilleHT.multiply(BigDecimal.ONE.add(tvaRate))
      .setScale(2, RoundingMode.HALF_UP)


    val produit = Produit().apply {
      this.ean13 = request.ean13
      this.codeLaborex = request.codeLaborex
      this.codeUbipharm = request.codeUbipharm
      this.reference = request.reference
      this.nom = request.nom
      this.stock = request.stock
      this.stockMax = request.stockMax
      this.stockMin = request.stockMin
      this.contenuDetail = request.contenuDetail
      this.prixDetail = request.prixDetail.toString()
      this.etat = request.etat
//      this.createdAt = LocalDateTime.now()
      this.reductionMax = request.reductionMax
      this.grossisteId = request.grossisteId
      this.detailId = request.detailId
      this.categorie = categorieRepository.findById(request.categorie!!).get()
      this.forme = formeRepository.findById(request.forme!!).get()
      this.fabriquant = fabriquantRepository.findById(request.fabriquant!!).get()
      this.rayon = rayonRepository.findById(request.rayon!!).get()
//      this.etagere =request.etagere
      this.magasin = magasinRepository.findById(request.magasin!!).get()
      this.supprimer = 0
    }
    val savedProduit = produitRepository.save(produit)

    // Créer la tarification initiale
//    val tarification = Tarification(
//      produit = savedProduit,
//      prixVente = request.prixVente!!.setScale(2, RoundingMode.HALF_UP), // Prix de vente effectif
//      dateDebut = LocalDateTime.now(),
//      actif = true
//    )
//    tarificationRepository.save(tarification)
//    savedProduit.tarifications?.add(tarification)

    // Créer l'entrée de stock initiale si fournie

    /* if (request.quantiteInitiale != null && request.quantiteInitiale > 0 && request.depotIdInitial != null) {
       val depot = depotRepository.findById(request.depotIdInitial)
         .orElseThrow { NotFoundException("Dépôt initial non trouvé avec ID: ${request.depotIdInitial}") }
       val rayon = request.rayonIdInitial?.let {
         rayonRepository.findById(it)
           .orElseThrow { NotFoundException("Rayon initial non trouvé avec ID: $it") }
       }

       val enRayon = EnRayon().apply {
         this.produit = savedProduit
         depot = depot
         rayon = rayon
         quantite = request.quantiteInitiale
         quantite = request.quantiteInitiale
         prixAchat = request.prixAchatInitial
         prixVente = request.prixVenteInitial
         dateEntree = LocalDateTime.now()
         numeroLot = request.numeroLotInitial
       }
       enRayonRepository.save(enRayon)
       savedProduit.enRayons?.add(enRayon)
     }*/
    return mapToProduitResponseDto(savedProduit)
  }

  fun getProduitById(id: Int): ProduitResponseDto {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }
    return mapToProduitResponseDto(produit)
  }

  fun getProduitByIdMap(id: Int): Map<String, Any?> {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }
    return mapToProduitResponseDtoMap(produit)
  }

  fun getProduitDetailById(id: Int): Map<String, Any?> {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }

    return mapOf(
      "id" to produit.id,
      "nom" to produit.nom,
      "stock" to produit.stock,
      "categorie" to produit.categorie?.nom,
//      "prixAchat" to produit.prixAchat,
//      "prixVente" to produit.prixVente,
      "prixAchat" to 0,
      "prixVente" to 0,
      "etat" to produit.etat
    )
  }

  fun getEnRayonDetailById(enRayonId: String): Map<String, Any?> {
    var enRayonList = enRayonRepository.findById(enRayonId!!.toString()).get()
    var produit = produitRepository.findById(enRayonList.produitId!!).get()
    return   mapOf(
      "id" to produit.id,
      "rayonId" to enRayonList.id,
      "nom" to produit.nom,
      "stock" to enRayonList.quantiteRestante,
      "dateLivraison" to enRayonList.dateLivraison,
      "datePeremption" to enRayonList.datePeremption,
      "categorie" to produit.categorie?.nom,
//      "prixAchat" to produit.prixAchat,
//      "prixVente" to produit.prixVente,
      "prixAchat" to 0,
      "prixVente" to 0,
      "type" to "produit"
    )
  }


  fun getProduitEnRayonDetailById(id: Int): List<Map<String, Any?>> {
    if (id < 700) {
      var produit = produitDetailRepository.findById(id).get()
      val p = produitDetailRepository.findByIdAndStockGreaterThanAndSupprimer(id)
      var data = mutableListOf<Map<String, Any?>>()
      data.add(
        mapOf(
          "id" to produit.id,
          "rayonId" to p.id,
          "nom" to produit.nom,
          "stock" to p.stock,
          "dateLivraison" to "",
          "datePeremption" to "",
          "categorie" to produit.grossisteList,
//      "prixAchat" to produit.prixAchat,
//      "prixVente" to produit.prixVente,
          "prixAchat" to 0,
          "prixVente" to 0,
          "type" to "detail"
        )
      )
      return data
    }
    else {
      val produit = produitRepository.findById(id)
        .filter { it.supprimer == 0 }
        .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }
      var enRayonList = enRayonRepository.findAllByProduitIdAndSupprimerAndQuantiteRestanteGreaterThan(produit.id!!).map { enRayon ->
        mapOf(
          "id" to produit.id,
          "rayonId" to enRayon.id,
          "nom" to produit.nom,
          "stock" to enRayon.quantiteRestante,
          "dateLivraison" to enRayon.dateLivraison,
          "datePeremption" to enRayon.datePeremption,
          "categorie" to produit.categorie?.nom,
//      "prixAchat" to produit.prixAchat,
//      "prixVente" to produit.prixVente,
          "prixAchat" to 0,
          "prixVente" to 0,
          "type" to "produit"
        )
      }
      return enRayonList
    }

  }

//  fun getAllProduits(): List<ProduitResponseDto> {
//    return produitRepository.findAllBySupprimer(0).map { mapToProduitResponseDto(it) }
//  }


  fun Produit.toResponseDto(): ProduitResponseDto {
    return ProduitResponseDto(
      id = this.id,
      nom = this.nom ?: "",
      description = "",
      codebarre = this.codeUbipharm ?: "",
      image = "",
      seuil = this.stockMin ?: 0,
      categorieNom = this.categorie?.nom ?: "",
      tva = BigDecimal.ZERO,
      prixAchatInitial = BigDecimal.ZERO,
      prixVenteActuel = BigDecimal.ZERO,
      margeBeneficiaire = BigDecimal.ZERO,
      prixVenteConseille = BigDecimal.ZERO,
      quantiteTotaleEnStock = this.stock ?: 0,
      dateCreation = null,
      dateModification = null,
      stockDetails = emptyList(), // Populate if needed
      uniteMesure = this.forme?.nom ?: ""
    )
  }

  fun getAllProduits(pageable: Pageable): Page<ProduitResponseDto> {
    return produitRepository.findAll(pageable).map { it.toResponseDto() }
  }

  fun searchProducts(query: String, page: Int, size: Int): Page<Map<String, Any?>> {
    val pageable = PageRequest.of(page, size)
    val produits = if (query.isNullOrBlank()){
      produitRepository.findAll(pageable)
        .map {
          mapOf(
            "id" to it.id,
            "nom" to it.nom,
            "stock" to it.stock,
            "prix" to 0,
            "type" to "produit"
          )
        }
    }
    else {
      produitRepository.findByNomContainingIgnoreCase(query, pageable)
        .map {
          mapOf(
            "id" to it.id,
            "nom" to it.nom,
            "stock" to it.stock,
            "prix" to 0,
            "type" to "produit"
          )
        }
    }

    val produitsMapped = produits
    val mergedList = (produitsMapped )
      .sortedBy { it["nom"]?.toString() }
    val paginatedList = mergedList
    val totalElements = produitsMapped.totalElements
    return PageImpl(paginatedList, PageRequest.of(page, size), totalElements.toLong())
  }


 fun searchProductsWithParam(query: String?, page: Int, size: Int,
                             rayonId: String?,
                             fabriquantId: String?,
                             etagereId: String?,
                             formeId: String?,
                             magasinId: String?,
                             categorieId: String?
                             ): Page<Map<String, Any?>> {
    val pageable = PageRequest.of(page, size)
   val spec = ProduitRepository.ProduitSpecification.withFilters(query, rayonId, fabriquantId, etagereId, formeId, magasinId, categorieId)
    return produitRepository.findAll(spec, pageable)
      .map {
        mapOf(
          "id" to it.id,
          "nom" to it.nom,
          "stock" to it.stock,
          "prix" to 0,
          "type" to "produit"
        )
      }
 }


  @Transactional
  fun updateProduit(id: Int, request: ProduitRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }

    produit.ean13 = request.ean13
//    produit.updatedAt = LocalDateTime.now()
    produit.codeLaborex = request.codeLaborex
    produit.codeUbipharm = request.codeUbipharm
    produit.reference = request.reference
    produit.nom = request.nom
    produit.stock = request.stock
    produit.stockMax = request.stockMax
    produit.stockMin = request.stockMin
    produit.contenuDetail = request.contenuDetail
    produit.prixDetail = request.prixDetail.toString()
    produit.etat = request.etat
    produit.reductionMax = request.reductionMax
    produit.grossisteId = request.grossisteId
    produit.detailId = request.detailId
    produit.categorie = categorieRepository.findById(request.categorie!!).get()
    produit.forme = formeRepository.findById(request.forme!!).get()
    produit.fabriquant = fabriquantRepository.findById(request.fabriquant!!).get()
    produit.rayon = rayonRepository.findById(request.rayon!!).get()
//produit.etagere =request.etagere
    produit.magasin = magasinRepository.findById(request.magasin!!).get()
    produit.supprimer = 0

    val savedProduit = produitRepository.save(produit)

    // La gestion de la mise à jour de la tarification et du stock est séparée
    // mais on pourrait permettre de mettre à jour le prix de vente actuel ici si nécessaire
    // ou la quantité initiale si c'est une "correction"

    return mapToProduitResponseDto(savedProduit)
  }

  @Transactional
  fun deleteProduit(id: Int) {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }
    produit.supprimer = 1
//    produit.updatedAt = LocalDateTime.now()
    produitRepository.save(produit)
  }

  @Transactional
  fun updateStockProduit(produitId: Int, request: ProduitStockUpdateRequestDto): ProduitResponseDto {
    var produit = produitRepository.findById(produitId)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $produitId") }
    var rayon = request.rayonId?.let {
      rayonRepository.findById(it).orElseThrow { NotFoundException("Rayon non trouvé avec ID: $it") }
    }

    // Chercher une entrée de stock existante pour ce produit, dépôt, rayon, et lot
    var stockEntry = enRayonRepository.findByProduitIdAndIdAndSupprimer(
      produit.id!!,request.rayonId!!.toString()
    )

    val nouvelleQuantite = stockEntry.quantite!! + request.quantiteChange
    if (nouvelleQuantite < 0) {
      throw ValidationException("Quantité en stock insuffisante pour effectuer l'opération. Stock actuel pour ce lot: ${stockEntry.quantite}")
    }
    stockEntry.quantite = nouvelleQuantite
    if (stockEntry.quantite == 0 && request.quantiteChange < 0) { // Si la quantité devient 0 après une sortie
      // Optionnel: marquer comme supprimé ou garder avec quantité 0 pour historique
      // stockEntry.supprimer = 1
    }
    if (request.quantiteChange > 0 && stockEntry.id == null) { // Si c'est une nouvelle entrée de stock
      stockEntry.datePeremption = request.datePeremption ?: stockEntry.datePeremption
    }

    enRayonRepository.save(stockEntry)
//    produit.updatedAt = LocalDateTime.now()
    produitRepository.save(produit)
    return mapToProduitResponseDto(produit)
  }

  @Transactional
  fun updateTarificationProduit(produitId: Int, request: ProduitTarificationUpdateRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(produitId)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $produitId") }

//    produit.updatedAt = LocalDateTime.now()
    produitRepository.save(produit) // Juste pour mettre à jour dateModification du produit
    return mapToProduitResponseDto(produit)
  }


  private fun mapToProduitResponseDto(produit: Produit): ProduitResponseDto {
//    val tarificationActive = tarificationRepository.findByProduitAndActifAndSupprimer(produit)
    val stockDetails = enRayonRepository.findAllByProduitIdAndSupprimer(produit.id!!)
      .filter { it.quantite!! > 0 } // Afficher seulement où il y a du stock
      .map { er ->

        StockDetailDto(
          enRayonId = er.id?.toInt(),
          productNom = "er.produit?.nom!!",
          depotNom = "er.produit!!.nom",
          rayonNom = "er.rayon?.nom",
          quantite = er.quantite!!,
          datePeremption = er.datePeremption,
          numeroLot = ""
        )
      }
    val quantiteTotale = stockDetails.sumOf { it.quantite }

    return ProduitResponseDto(
      id = produit.id,
      nom = produit.nom!!,
      description = "",
      codebarre = "",
      image = "",
      seuil = produit.stockMin,
      categorieNom = produit.categorie!!.nom,
      tva = 0.20.toBigDecimal(), // TVA par défaut, peut être modifié
      prixAchatInitial = 0.toBigDecimal(), // Prix d'achat initial, peut être modifié
      margeBeneficiaire = BigDecimal.ZERO,
      prixVenteConseille = 0.toBigDecimal(), // Prix de vente conseillé, peut être modifié
      prixVenteActuel = BigDecimal.ZERO,
      quantiteTotaleEnStock = quantiteTotale,
      dateCreation = null,
      dateModification = null,
      stockDetails = stockDetails,
      uniteMesure = produit.forme?.nom ?: "",
    )
  }

  private fun mapToProduitResponseDtoMap(produit: Produit): Map<String, Any?> {

    val stockDetails = enRayonRepository.findAllByProduitIdAndSupprimer(produit.id!!)
      .filter { it.quantite!! > 0 }
      .map { er ->
        mapOf(
          "enRayonId" to er.id,
          "productNom" to "er.produit?.nom!!",
          "depotNom" to "er.produit!!.nom",
          "rayonNom" to "er.rayon?.nom",
          "quantite" to er.quantite!!,
          "datePeremption" to er.datePeremption,
          "numeroLot" to ""
        )
      }

    val quantiteTotale = stockDetails.sumBy { it["quantite"] as Int }

    return mapOf(
      "id" to produit.id,
      "nom" to produit.nom!!,
      "ean13" to produit.ean13!!,
      "codeLaborex" to produit.codeLaborex!!,
      "codeUbipharm" to produit.codeUbipharm!!,
      "reference" to produit.reference!!,
      "description" to "",
      "codebarre" to "",
      "image" to "",
      "seuil" to produit.stockMin,
      "categorieId" to produit.categorie!!.id,
      "categorieNom" to produit.categorie!!.nom,
      "rayonId" to produit.rayon!!.id,
      "rayonNom" to produit.rayon!!.nom,
      "etagere" to produit.etagere,
      "magasinNom" to produit.magasin!!.nom,
      "magasinId" to produit.magasin!!.id,
      "formeNom" to produit.forme!!.nom,
      "formeId" to produit.forme!!.id,
      "fabriquantId" to produit.fabriquant!!.id,
      "fabriquantNom" to produit.fabriquant!!.nom,
      "tva" to 0.20.toBigDecimal(),
      "prixAchatInitial" to 0.toBigDecimal(),
      "margeBeneficiaire" to BigDecimal.ZERO,
      "prixVenteConseille" to 0.toBigDecimal(),
      "prixVenteActuel" to BigDecimal.ZERO,
      "quantiteTotaleEnStock" to quantiteTotale,
//      "dateCreation" to produit.createdAt,
      "contenuDetail" to produit.contenuDetail,
//      "dateModification" to produit.updatedAt,
      "stock" to produit.stock,
      "stockMin" to produit.stockMin,
      "stockMax" to produit.stockMax,
      "reductionMax" to produit.reductionMax,
      "stockDetails" to stockDetails,
    )
  }

  // Services pour Categorie, Fournisseur, Depot, Rayon
  // Create Categorie
  fun createCategorie(dto: CategorieDto): CategorieDto {
    if (categorieRepository.findByNom(dto.nom) != null) {
      throw ValidationException("Une catégorie avec le nom '${dto.nom}' existe déjà.")
    }
    val categorie = Categorie().apply {
      nom = dto.nom
    }
    val saved = categorieRepository.save(categorie)
    return CategorieDto(saved.id, saved.nom!!)
  }

  fun getAllCategories(): List<CategorieDto> =
    categorieRepository.findAllBySupprimer(0).map { CategorieDto(it.id, it.nom!!) }

  // Create Fournisseur
  fun createFournisseur(dto: FournisseurDto): FournisseurDto {
    dto.email?.let { email ->
      if (fournisseurRepository.findByEmailAndSupprimer(email, 0) != null) {
        throw ValidationException("Un fournisseur avec l'email '${email}' existe déjà.")
      }
    }
    val fournisseur = Fournisseur().apply {
      nom = dto.nom
      email = dto.email
      telephone = dto.telephone
    }
    val saved = fournisseurRepository.save(fournisseur)
    return FournisseurDto(saved.id, saved.nom!!, saved.email, saved.telephone)
  }

  fun getAllFournisseurs(): List<FournisseurDto> =
    fournisseurRepository.findAllBySupprimer(0).map { FournisseurDto(it.id, it.nom!!, it.email, it.telephone) }

  // Create Rayon
  fun createRayon(dto: RayonDto): RayonDto {
    val rayon = Rayon().apply {
      this.nom = dto.nom
      this.code = dto.code
    }
    val saved = rayonRepository.save(rayon)
    return RayonDto(saved.id, saved.nom, saved.code)
  }

  fun getAllRayons(): List<RayonDto> =
    rayonRepository.findAllBySupprimer(0)!!.map { RayonDto(it.id, it.nom, it.code!!) }


  @Transactional
  fun retournerProduitsVendusEtEnRayon(
    venteId: Long,
    produitsRetour: List<ProduitRetourRequestDto>
  ): RetourProduit {
    if (produitsRetour.isEmpty()) {
      throw IllegalArgumentException("La liste des produits à retourner ne peut pas être vide.")
    }

    val vente = venteRepository.findById(venteId)
      .orElseThrow { NotFoundException("Vente non trouvée avec l'ID: $venteId") }

    val currentUser = userUtils.getCurrentUser()
    val employe = employeRepository.findByUser(currentUser!!)

    val caisse =  caisseService.getCaisseActive()

    var retourProduit = RetourProduit().apply {
      this.vente = vente
      this.caisse = caisse
      this.employe = employe
      this.dateRetour = LocalDateTime.now()
    }
    retourProduit = retourProduitRepository.save(retourProduit)

    produitsRetour.forEach { produitRetourRequest ->
      var produitConcerner = concernerRepository.findByVenteIdAndProduitId(
        vente.id!!.toLong(),
        produitRepository.findById(produitRetourRequest.produitId.toInt()).get().id!!.toInt()
      ) ?: throw NotFoundException("Produit non trouvé dans la vente avec l'ID: ${produitRetourRequest.produitId}")

      if (produitRetourRequest.quantiteRetour <= 0) {
        throw IllegalArgumentException("La quantité retournée doit être supérieure à zéro.")
      }

      if (produitRetourRequest.quantiteRetour > produitConcerner.quantite!!) {
        throw IllegalArgumentException("La quantité retournée ne peut pas dépasser la quantité vendue.")
      }

      // Update Concerner
      produitConcerner.quantite = produitConcerner.quantite!! - produitRetourRequest.quantiteRetour
      produitConcerner = concernerRepository.save(produitConcerner)

      // Create ProduitRetour
      val produitRetour = ProduitRetour().apply {
        this.retourProduit = retourProduit
        this.concerner = produitConcerner
        this.quantite = produitRetourRequest.quantiteRetour
      }
      produitRetourRepository.save(produitRetour)

      // Update stock
      val produit = produitRepository.findById(produitRetourRequest.produitId.toInt())
        .orElseThrow { NotFoundException("Produit non trouvé avec l'ID: ${produitRetourRequest.produitId}") }
      produit.stock = produit.stock!! + produitRetourRequest.quantiteRetour
      produitRepository.save(produit)

      // Update or create EnRayon
      val enRayon = enRayonRepository.findById(produitRetourRequest.rayonId!!.toString()).get()
//      enRayon.quantite = enRayon.quantite!! + produitRetourRequest.quantiteRetour
      enRayon.quantiteRestante = enRayon.quantiteRestante!! + produitRetourRequest.quantiteRetour
      enRayonRepository.save(enRayon)
    }

    return retourProduit
  }


  @Transactional
  fun getProduitDetails(produitId: Int): Map<String, Any?> {
    val produit = produitRepository.findById(produitId).get()
    val now = LocalDateTime.now()
    val startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay()

    val toutesLesVentes = concernerRepository.findByProduitId(produit.id!!.toInt())
    val ventesDuMois = toutesLesVentes.filter { v ->
      var vente = venteRepository.findById(v?.venteId!!).get()
      vente.dateVente?.isAfter(startOfMonth) == true
    }

    val totalQuantiteMois = ventesDuMois.sumOf { it?.quantite ?: 0 }
    val totalReductionMois = ventesDuMois.fold(BigDecimal.ZERO) { acc, c ->
      acc.add((c?.reduction as? BigDecimal) ?: BigDecimal.ZERO)
    }

    val totalVenteMois = ventesDuMois.fold(BigDecimal.ZERO) { acc, c ->
      val pu = (c?.prixUnit?.toBigDecimal()) ?: BigDecimal.ZERO
      val qte = (c?.quantite?.toBigDecimal() ?: BigDecimal.ZERO)
      val red = (c?.reduction?.toBigDecimal()) ?: BigDecimal.ZERO
      acc.add(pu.multiply(qte.subtract(red)))
    }

    val ventesMoisSummary = listOf(
      mapOf(
        "nom" to "Vente du Mois",
        "quantite" to totalQuantiteMois,
        "reduction" to totalReductionMois,
        "vente" to totalVenteMois
      )
    )

    val totalQuantite = toutesLesVentes.sumOf { it?.quantite ?: 0 }
    val totalReduction = toutesLesVentes.fold(BigDecimal.ZERO) { acc, c ->
      acc.add((c?.reduction?.toBigDecimal()) ?: BigDecimal.ZERO)
    }

    val totalVente = toutesLesVentes.fold(BigDecimal.ZERO) { acc, c ->
      val pu = (c?.prixUnit!!.toBigDecimal()) ?: BigDecimal.ZERO
      val qte = c?.quantite?.toBigDecimal() ?: BigDecimal.ZERO
      val red = c?.reduction?.toBigDecimal() ?: BigDecimal.ZERO
      acc.add(pu.multiply(qte.subtract(red)))
    }

    val ventesTotalSummary = listOf(
      mapOf(
        "nom" to "Vente Totale",
        "quantite" to totalQuantite,
        "reduction" to totalReduction,
        "vente" to totalVente
      )
    )

    val ventesList = toutesLesVentes.map { c ->
      var vente = venteRepository.findById(c!!.venteId!!).get()
      val v = vente
      val pu = c?.prixUnit?.toBigDecimal() ?: BigDecimal.ZERO
      val qte = c?.quantite ?: 0
      val red = c?.reduction?.toBigDecimal() ?: BigDecimal.ZERO
      val total = pu * (qte.toBigDecimal())
      mapOf(
        "date" to v?.dateVente,
        "vendeur" to v?.employe?.user?.nom,
        "client" to v?.user?.nom,
        "prixUnitaire" to pu,
        "quantite" to qte,
        "prixTotal" to total,
        "reduction" to red,
        "prixVente" to total.subtract(red)
      )
    }

    val toutesLesCommandes = produitCmdRepository.findByProduit(produit)
    val commandesDuMois = toutesLesCommandes.filter { lc ->
      var commande = commandeRepository.findById(lc.commandeId!!.toLong()).get()
      commande?.dateCreation?.isAfter(startOfMonth) == true
    }

    val totalQtCmdMois = commandesDuMois.sumOf { it?.qtiteCmd ?: 0 }
    val totalCoutMois = commandesDuMois.fold(BigDecimal.ZERO) { acc, c ->
      val pa = c?.prixPublic?.toBigDecimal() ?: BigDecimal.ZERO
      val q = c?.qtiteCmd?.toBigDecimal() ?: BigDecimal.ZERO
      acc.add(pa * q)
    }
    val commandesMoisSummary = listOf(
      mapOf(
        "nom" to "Commande du Mois",
        "quantite" to totalQtCmdMois,
        "cout" to totalCoutMois
      )
    )

    val totalQtCmd = toutesLesCommandes.sumOf { it?.qtiteCmd ?: 0 }
    val totalCout = toutesLesCommandes.fold(BigDecimal.ZERO) { acc, c ->
      val pa = c?.prixPublic?.toBigDecimal() ?: BigDecimal.ZERO
      val q = c?.qtiteCmd?.toBigDecimal() ?: BigDecimal.ZERO
      acc.add(pa * q)
    }
    val commandesTotalSummary = listOf(
      mapOf(
        "nom" to "Commande Totale",
        "quantite" to totalQtCmd,
        "cout" to totalCout
      )
    )

    var commandePriceTotalRecu = 0;
    var commandePriceTotalCommande = 0;

    val commandesList = toutesLesCommandes.map { c ->
      var commande = commandeRepository.findById(c.commandeId!!.toLong()).get()
      val cmd = commande
      val pa = c?.puCmd?.toBigDecimal() ?: BigDecimal.ZERO
      val pv = c?.prixPublic ?: BigDecimal.ZERO
      val qc = c?.qtiteCmd ?: 0
      val qr = c?.qtiteRecu ?: 0
      val totCmd = pa * (qc.toBigDecimal())
      val totRec = pa * (qr.toBigDecimal())
      commandePriceTotalCommande += totCmd.toInt()
      commandePriceTotalRecu += totRec.toInt()
      mapOf(
        "date" to cmd?.dateCreation,
        "produitId" to produit.id,
        "commandeId" to cmd?.id,
        "fournisseur" to cmd?.fournisseur?.nom,
        "prixAchat" to pa,
        "prixVente" to pv,
        "quantiteCommandee" to qc,
        "quantiteRecue" to qr,
        "totalCommandee" to totCmd,
        "totalRecu" to totRec,
        "etat" to cmd?.etat
      )
    }

    val entreesEnStock = enRayonRepository.findAllByProduitIdAndSupprimer(produit.id!!, 0)
    val quantiteStockTotal = entreesEnStock.sumOf { it?.quantite ?: 0 }
    val stockSummary = mapOf(
      "totalCommandeValue" to totalCout,
      "stockTotalQuantity" to quantiteStockTotal
    )

    val stockEntries = entreesEnStock.map { e ->
      mapOf(
        "rayonId" to e?.id,
        "id" to produit.id,
        "nom" to produit.nom,
        "fournisseurId" to e?.fournisseur?.id,
        "nomFournisseur" to e?.fournisseur?.nom,
        "codeFournisseur" to e?.fournisseur?.code,
        "dateLivraison" to e?.dateLivraison,
        "datePeremption" to e?.datePeremption,
        "prixAchat" to (e.prixAchat ?: BigDecimal.ZERO),
        "prixVente" to (e.prixVente ?: BigDecimal.ZERO),
        "reduction" to (e?.reduction ?: BigDecimal.ZERO),
        "quantiteRecu" to (e?.quantite ?: 0),
        "quantiteStock" to (e?.quantiteRestante ?: 0)
      )
    }

    val stockSorties = toutesLesVentes.map { c ->
      var vente = venteRepository.findById(c!!.venteId!!.toLong()).get()
      mapOf(
        "nom" to produit.nom,
        "quantite" to (c?.quantite ?: 0),
        "detail" to "Vente #${vente?.id}",
        "forme" to "Vente",
        "dateOperation" to vente?.dateVente,
        "operation" to "SORTIE_VENTE"
      )
    }

    return mapOf(
      "ventesMois" to ventesMoisSummary,
      "ventesTotal" to ventesTotalSummary,
      "ventesList" to ventesList,

      "commandePriceTotalRecu" to commandePriceTotalRecu,
      "commandePriceTotalCommande" to commandePriceTotalCommande,
      "commandesMois" to commandesMoisSummary,
      "commandesTotal" to commandesTotalSummary,
      "commandesList" to commandesList,

      "stockSummary" to stockSummary,
      "stockEntries" to stockEntries,
      "stockSorties" to stockSorties
    )
  }

}

data class ProduitRetourRequestDto(
  val produitId: Long,
  val rayonId: Long,
  val quantiteRetour: Int
)
