package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.exceptions.NotFoundException
import com.example.backend.exceptions.ValidationException
import com.example.backend.models.*
import com.example.backend.repositories.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime

@Service
class ProduitService(
  private val produitRepository: ProduitRepository,
  private val categorieRepository: CategorieRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val rayonRepository: RayonRepository,
  private val enRayonRepository: EnRayonRepository,
  private val formeRepository: FormeRepository,
  private val magasinRepository: MagasinRepository,
  private val fabriquantRepository: FabriquantRepository
)
{

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
      this.prixDetail = request.prixDetail
      this.etat = request.etat
      this.createdAt = LocalDateTime.now()
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

//  fun getAllProduits(): List<ProduitResponseDto> {
//    return produitRepository.findAllBySupprimer(0).map { mapToProduitResponseDto(it) }
//  }


  fun Produit.toResponseDto(): ProduitResponseDto {
      return ProduitResponseDto(
          id = this.id,
          nom = this.nom ?: "",
          description = "",
          codebarre = this.codeUbipharm ?: "",
          image =  "",
          seuil = this.stockMin ?: 0,
          categorieNom = this.categorie?.nom ?: "",
          tva = BigDecimal.ZERO,
          prixAchatInitial =  BigDecimal.ZERO,
          margeBeneficiaire =  BigDecimal.ZERO,
          prixVenteConseille =  BigDecimal.ZERO,
          prixVenteActuel =  BigDecimal.ZERO,
          quantiteTotaleEnStock = this.stock ?: 0,
          dateCreation = this.createdAt,
          dateModification = this.updatedAt,
          stockDetails = emptyList(), // Populate if needed
          uniteMesure = this.forme?.nom ?: ""
      )
  }

  fun getAllProduits(pageable: Pageable): Page<ProduitResponseDto> {
      return produitRepository.findAll(pageable).map { it.toResponseDto() }
  }

  fun searchProducts(query: String, page: Int, size: Int): Page<ProduitResponseDto> {
    val data = produitRepository.findByNomContainingIgnoreCase(query)
    val data2 = produitRepository.findByNomContaining(query)
    println("Data size: ${data.size}, Data2 size: ${data2.size}")
    println("Query: $query, Page: $page, Size: $size")
    println("data: $data")
    println("data2: $data2")
    val pageable = PageRequest.of(page, size)
    return produitRepository.findByNomContainingIgnoreCase(query, pageable).map { it.toResponseDto() }
  }

  @Transactional
  fun updateProduit(id: Int, request: ProduitRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }

    produit.ean13 = request.ean13
    produit.updatedAt = LocalDateTime.now()
    produit.codeLaborex = request.codeLaborex
    produit.codeUbipharm = request.codeUbipharm
    produit.reference = request.reference
    produit.nom = request.nom
    produit.stock = request.stock
    produit.stockMax = request.stockMax
    produit.stockMin = request.stockMin
    produit.contenuDetail = request.contenuDetail
    produit.prixDetail = request.prixDetail
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
    produit.updatedAt = LocalDateTime.now()
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
    var stockEntry = enRayonRepository.findByProduitAndRayonAndSupprimer(
      produit, rayon
    ).orElseGet {
      // Si pas d'entrée pour ce lot spécifique, créer une nouvelle si on ajoute du stock
      if (request.quantiteChange > 0) {
        EnRayon().apply {
          this.produit = produit
          this.rayon = rayon
          this.quantite = 0 // Sera mis à jour
          this.dateLivraison = LocalDateTime.now()
          this.datePeremption = request.datePeremption
        }
      } else {
        throw NotFoundException("Aucun stock trouvé pour ce produit/dépôt/rayon/lot à décrémenter.")
      }
    }

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
    produit.updatedAt = LocalDateTime.now()
    produitRepository.save(produit)
    return mapToProduitResponseDto(produit)
  }

  @Transactional
  fun updateTarificationProduit(produitId: Int, request: ProduitTarificationUpdateRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(produitId)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $produitId") }

    produit.updatedAt = LocalDateTime.now()
    produitRepository.save(produit) // Juste pour mettre à jour dateModification du produit
    return mapToProduitResponseDto(produit)
  }


  private fun mapToProduitResponseDto(produit: Produit): ProduitResponseDto {
//    val tarificationActive = tarificationRepository.findByProduitAndActifAndSupprimer(produit)
    val stockDetails = enRayonRepository.findAllByProduitAndSupprimer(produit)
      .filter { it.quantite!! > 0 } // Afficher seulement où il y a du stock
      .map { er ->
        StockDetailDto(
          enRayonId = er.id,
          productNom = er.produit?.nom!!,
          depotNom = er.produit!!.nom,
          rayonNom = er.rayon?.nom,
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
      dateCreation = produit.createdAt,
      dateModification = produit.updatedAt,
      stockDetails = stockDetails,
      uniteMesure = produit.forme?.nom ?: "",
    )
  }

  // Services pour Categorie, Fournisseur, Depot, Rayon
  // Create Categorie
  fun createCategorie(dto: CategorieDto): CategorieDto {
    if (categorieRepository.findByNom(dto.nom)!=null) {
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
    rayonRepository.findAllBySupprimer(0)!!.map { RayonDto(it.id, it.nom, it.code!!)}
}
