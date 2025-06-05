package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.models.*
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import java.util.*

@Service
class ProduitService(
  private val produitRepository: ProduitRepository,
  private val categorieRepository: CategorieRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val depotRepository: DepotRepository,
  private val rayonRepository: RayonRepository,
  private val enRayonRepository: EnRayonRepository,
  private val tarificationRepository: TarificationRepository
) {

  @Transactional
  fun createProduit(request: ProduitRequestDto): ProduitResponseDto {
    request.codebarre?.let {
      if (produitRepository.findByCodebarreAndSupprimer(it).isPresent) {
        throw ValidationException("Un produit avec le code-barres '${it}' existe déjà.")
      }
    }

    val categorie = request.categorieId?.let {
      categorieRepository.findById(it).orElseThrow { NotFoundException("Catégorie non trouvée avec ID: $it") }
    }
    val fournisseur = request.fournisseurId?.let {
      fournisseurRepository.findById(it).orElseThrow { NotFoundException("Fournisseur non trouvé avec ID: $it") }
    }

    val prixAchat = request.prixAchatInitial ?: BigDecimal.ZERO
    val marge = request.margeBeneficiaire ?: BigDecimal.ZERO
    val tvaRate = request.tva ?: BigDecimal.ZERO // e.g., 0.20

    // Calcul du prix de vente conseillé: PrixAchat * (1 + Marge) * (1 + TVA)
    // Ou si TVA est incluse dans la marge: PrixAchat * (1 + Marge + (Marge*TVA))
    // Pour simplifier : (PrixAchat / (1 - Marge)) * (1 + TVA) si marge est sur prix de vente
    // Ici, on suppose que la marge s'applique sur le prix d'achat HT, puis on ajoute la TVA
    val prixVenteConseilleHT = prixAchat.multiply(BigDecimal.ONE.add(marge))
    val prixVenteConseilleTTC = prixVenteConseilleHT.multiply(BigDecimal.ONE.add(tvaRate))
      .setScale(2, RoundingMode.HALF_UP)


    val produit = Produit(
      nom = request.nom,
      description = request.description,
      codebarre = request.codebarre,
      image = request.image,
      seuil = request.seuil ?: 0,
      categorie = categorie,
      fournisseur = fournisseur,
      uniteMesure = request.uniteMesure,
      tva = tvaRate,
      prixAchatInitial = prixAchat,
      margeBeneficiaire = marge,
      prixVenteConseille = prixVenteConseilleTTC,
      dateCreation = LocalDateTime.now(),
      dateModification = LocalDateTime.now()
    )
    val savedProduit = produitRepository.save(produit)

    // Créer la tarification initiale
    val tarification = Tarification(
      produit = savedProduit,
      prixVente = request.prixVenteInitial.setScale(2, RoundingMode.HALF_UP), // Prix de vente effectif
      dateDebut = LocalDateTime.now(),
      actif = true
    )
    tarificationRepository.save(tarification)
    savedProduit.tarifications?.add(tarification)

    // Créer l'entrée de stock initiale si fournie
    if (request.quantiteInitiale != null && request.quantiteInitiale > 0 && request.depotIdInitial != null) {
      val depot = depotRepository.findById(request.depotIdInitial)
        .orElseThrow { NotFoundException("Dépôt initial non trouvé avec ID: ${request.depotIdInitial}") }
      val rayon = request.rayonIdInitial?.let {
        rayonRepository.findById(it)
          .orElseThrow { NotFoundException("Rayon initial non trouvé avec ID: $it") }
      }

      val enRayon = EnRayon(
        produit = savedProduit,
        depot = depot,
        rayon = rayon,
        quantite = request.quantiteInitiale,
        dateEntree = LocalDateTime.now(),
        datePeremption = request.datePeremptionInitiale,
        numeroLot = request.numeroLotInitial
      )
      enRayonRepository.save(enRayon)
      savedProduit.enRayons?.add(enRayon)
    }
    return mapToProduitResponseDto(savedProduit)
  }

  fun getProduitById(id: Int): ProduitResponseDto {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }
    return mapToProduitResponseDto(produit)
  }

  fun getAllProduits(): List<ProduitResponseDto> {
    return produitRepository.findAllBySupprimer(0).map { mapToProduitResponseDto(it) }
  }

  @Transactional
  fun updateProduit(id: Int, request: ProduitRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(id)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $id") }

    request.codebarre?.let { cb ->
      produitRepository.findByCodebarreAndSupprimer(cb).ifPresent { existing ->
        if (existing.id != produit.id) {
          throw ValidationException("Un autre produit avec le code-barres '$cb' existe déjà.")
        }
      }
      produit.codebarre = cb
    }

    produit.nom = request.nom
    produit.description = request.description
    produit.image = request.image
    produit.seuil = request.seuil ?: produit.seuil
    produit.uniteMesure = request.uniteMesure ?: produit.uniteMesure
    produit.tva = request.tva ?: produit.tva
    produit.prixAchatInitial = request.prixAchatInitial ?: produit.prixAchatInitial
    produit.margeBeneficiaire = request.margeBeneficiaire ?: produit.margeBeneficiaire

    request.categorieId?.let {
      produit.categorie = categorieRepository.findById(it)
        .orElseThrow { NotFoundException("Catégorie non trouvée avec ID: $it") }
    }
    request.fournisseurId?.let {
      produit.fournisseur = fournisseurRepository.findById(it)
        .orElseThrow { NotFoundException("Fournisseur non trouvé avec ID: $it") }
    }

    // Recalculer prix de vente conseillé si des éléments constitutifs changent
    val prixAchat = produit.prixAchatInitial ?: BigDecimal.ZERO
    val marge = produit.margeBeneficiaire ?: BigDecimal.ZERO
    val tvaRate = produit.tva ?: BigDecimal.ZERO
    val prixVenteConseilleHT = prixAchat.multiply(BigDecimal.ONE.add(marge))
    produit.prixVenteConseille = prixVenteConseilleHT.multiply(BigDecimal.ONE.add(tvaRate))
      .setScale(2, RoundingMode.HALF_UP)

    produit.dateModification = LocalDateTime.now()
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
    produit.dateModification = LocalDateTime.now()
    // Logiquement supprimer les tarifications et stocks associés
    produit.tarifications?.forEach { it.supprimer = 1; it.actif = false }
    produit.enRayons?.forEach { it.supprimer = 1 }
    produitRepository.save(produit)
  }

  @Transactional
  fun updateStockProduit(produitId: Int, request: ProduitStockUpdateRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(produitId)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $produitId") }
    val depot = depotRepository.findById(request.depotId)
      .orElseThrow { NotFoundException("Dépôt non trouvé avec ID: ${request.depotId}") }
    val rayon = request.rayonId?.let {
      rayonRepository.findById(it).orElseThrow { NotFoundException("Rayon non trouvé avec ID: $it") }
    }

    // Chercher une entrée de stock existante pour ce produit, dépôt, rayon, et lot
    var stockEntry = enRayonRepository.findByProduitAndDepotAndRayonAndNumeroLotAndSupprimer(
      produit, depot, rayon, request.numeroLot
    ).orElseGet {
      // Si pas d'entrée pour ce lot spécifique, créer une nouvelle si on ajoute du stock
      if (request.quantiteChange > 0) {
        EnRayon(
          produit = produit,
          depot = depot,
          rayon = rayon,
          quantite = 0, // Sera mis à jour
          dateEntree = LocalDateTime.now(),
          numeroLot = request.numeroLot,
          datePeremption = request.datePeremption
        )
      } else {
        throw NotFoundException("Aucun stock trouvé pour ce produit/dépôt/rayon/lot à décrémenter.")
      }
    }

    val nouvelleQuantite = stockEntry.quantite + request.quantiteChange
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
    produit.dateModification = LocalDateTime.now()
    produitRepository.save(produit)
    return mapToProduitResponseDto(produit)
  }

  @Transactional
  fun updateTarificationProduit(produitId: Int, request: ProduitTarificationUpdateRequestDto): ProduitResponseDto {
    val produit = produitRepository.findById(produitId)
      .filter { it.supprimer == 0 }
      .orElseThrow { NotFoundException("Produit non trouvé avec ID: $produitId") }

    // Désactiver l'ancienne tarification active
    tarificationRepository.findByProduitAndActifAndSupprimer(produit).ifPresent { oldTarif ->
      oldTarif.actif = false
      oldTarif.dateFin = LocalDateTime.now()
      tarificationRepository.save(oldTarif)
    }

    // Créer la nouvelle tarification
    val nouvelleTarification = Tarification(
      produit = produit,
      prixVente = request.nouveauPrixVente.setScale(2, RoundingMode.HALF_UP),
      dateDebut = request.dateDebut ?: LocalDateTime.now(),
      actif = true
    )
    tarificationRepository.save(nouvelleTarification)

    produit.dateModification = LocalDateTime.now()
    produitRepository.save(produit) // Juste pour mettre à jour dateModification du produit
    return mapToProduitResponseDto(produit)
  }


  private fun mapToProduitResponseDto(produit: Produit): ProduitResponseDto {
    val tarificationActive = tarificationRepository.findByProduitAndActifAndSupprimer(produit)
    val stockDetails = enRayonRepository.findAllByProduitAndSupprimer(produit)
      .filter { it.quantite > 0 } // Afficher seulement où il y a du stock
      .map { er ->
        StockDetailDto(
          enRayonId = er.id,
          depotNom = er.depot.nom,
          rayonNom = er.rayon?.nom,
          quantite = er.quantite,
          datePeremption = er.datePeremption,
          numeroLot = er.numeroLot
        )
      }
    val quantiteTotale = stockDetails.sumOf { it.quantite }

    return ProduitResponseDto(
      id = produit.id,
      nom = produit.nom,
      description = produit.description,
      codebarre = produit.codebarre,
      image = produit.image,
      seuil = produit.seuil,
      categorieNom = produit.categorie?.nom,
      fournisseurNom = produit.fournisseur?.nom,
      uniteMesure = produit.uniteMesure,
      tva = produit.tva,
      prixAchatInitial = produit.prixAchatInitial,
      margeBeneficiaire = produit.margeBeneficiaire,
      prixVenteConseille = produit.prixVenteConseille,
      prixVenteActuel = tarificationActive.map { it.prixVente }.orElse(null),
      quantiteTotaleEnStock = quantiteTotale,
      dateCreation = produit.dateCreation,
      dateModification = produit.dateModification,
      stockDetails = stockDetails
    )
  }

  // Services pour Categorie, Fournisseur, Depot, Rayon
  // Create Categorie
  fun createCategorie(dto: CategorieDto): CategorieDto {
    if (categorieRepository.findByNomAndSupprimer(dto.nom).isPresent) {
      throw ValidationException("Une catégorie avec le nom '${dto.nom}' existe déjà.")
    }
    val categorie = Categorie(nom = dto.nom, description = dto.description)
    val saved = categorieRepository.save(categorie)
    return CategorieDto(saved.id, saved.nom, saved.description)
  }
  fun getAllCategories(): List<CategorieDto> = categorieRepository.findAllBySupprimer(0).map { CategorieDto(it.id, it.nom, it.description) }

  // Create Fournisseur
  fun createFournisseur(dto: FournisseurDto): FournisseurDto {
    dto.email?.let {
      if (fournisseurRepository.findByEmailAndSupprimer(it).isPresent) {
        throw ValidationException("Un fournisseur avec l'email '${it}' existe déjà.")
      }
    }
    val fournisseur = Fournisseur(nom = dto.nom, email = dto.email, telephone = dto.telephone)
    val saved = fournisseurRepository.save(fournisseur)
    return FournisseurDto(saved.id, saved.nom, saved.email, saved.telephone)
  }
  fun getAllFournisseurs(): List<FournisseurDto> = fournisseurRepository.findAllBySupprimer(0).map { FournisseurDto(it.id, it.nom, it.email, it.telephone) }

  // Create Depot
  fun createDepot(dto: DepotDto): DepotDto {
    if (depotRepository.findByNomAndSupprimer(dto.nom).isPresent) {
      throw ValidationException("Un dépôt avec le nom '${dto.nom}' existe déjà.")
    }
    val depot = Depot(nom = dto.nom, adresse = dto.adresse)
    val saved = depotRepository.save(depot)
    return DepotDto(saved.id, saved.nom, saved.adresse)
  }
  fun getAllDepots(): List<DepotDto> = depotRepository.findAllBySupprimer(0).map { DepotDto(it.id, it.nom, it.adresse) }

  // Create Rayon
  fun createRayon(dto: RayonDto): RayonDto {
    val depot = depotRepository.findById(dto.depotId)
      .orElseThrow { NotFoundException("Dépôt non trouvé avec ID: ${dto.depotId}") }
    if (rayonRepository.findByNomAndDepotAndSupprimer(dto.nom, depot).isPresent) {
      throw ValidationException("Un rayon avec le nom '${dto.nom}' existe déjà dans ce dépôt.")
    }
    val rayon = Rayon(nom = dto.nom, description = dto.description, depot = depot)
    val saved = rayonRepository.save(rayon)
    return RayonDto(saved.id, saved.nom, saved.description, saved.depot.id!!)
  }
  fun getAllRayons(): List<RayonDto> = rayonRepository.findAllBySupprimer(0).map { RayonDto(it.id, it.nom, it.description, it.depot.id!!) }
}

// Exceptions personnalisées
// src/main/kotlin/com/example/backend/exceptions/NotFoundException.kt
package com.example.backend.exceptions
class NotFoundException(message: String) : RuntimeException(message)

// src/main/kotlin/com/example/backend/exceptions/ValidationException.kt
package com.example.backend.exceptions
class ValidationException(message: String) : RuntimeException(message)
