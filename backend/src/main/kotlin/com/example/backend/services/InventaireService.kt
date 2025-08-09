package com.example.backend.services

import com.example.backend.dtos.InventaireNewCreatetDto
import com.example.backend.dtos.InventaireOneProductUpdateRequestDto
import com.example.backend.dtos.InventaireRequestDto
import com.example.backend.dtos.InventaireUpdateRequestDto
import com.example.backend.models.Inventaire
import com.example.backend.models.ProduitInventaire
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class InventaireService(
  private val userUtils: UserUtils,
  private val enRayonRepository: EnRayonRepository,
  private val employeRepository: EmployeRepository,
  private val inventaireRepository: InventaireRepository,
  private val produitInventorieRepository: ProduitInventaireRepository,
  private val produitRepository: ProduitRepository,
  private val rayonRepository: RayonRepository,
  private val categorieRepository: CategorieRepository,
  private val fabriquantRepository: FabriquantRepository,
  private val formeRepository: FormeRepository, private val fournisseurRepository: FournisseurRepository
) {

  @Transactional
  fun creerInventaire(data: InventaireRequestDto): Inventaire {
    var employe = userUtils.getCurrentEmploye()
    val inventaire = Inventaire().apply {
      this.dateDebut = LocalDateTime.now()
      etat = Inventaire.INVENTAIRE_EN_COURS
    }
    val savedInventaire = inventaireRepository.save(inventaire)

    data.produitList.forEach { produit ->
      var rayon = enRayonRepository.findById(produit.rayonId.toString())
        .orElseThrow { IllegalArgumentException("Rayon introuvable avec l'ID: ${produit.rayonId}") }
      var produitInventaire = ProduitInventaire().apply {}
      produitInventaire.inventaire = savedInventaire
      produitInventaire.enRayon = rayon
      produitInventaire.employe = employe
      produitInventaire.stockValide = produit.quantiteReel
      produitInventaire.stockAvant = produit.quantiteSysteme
      produitInventorieRepository.save(produitInventaire)
    }

    return savedInventaire
  }

  @Transactional
  fun creerInventaireNew(data: InventaireNewCreatetDto): Inventaire {
    val employe = userUtils.getCurrentEmploye()
    val rayon = if (data.rayonId != null) {
      rayonRepository.findById(data.rayonId.toInt()).orElse(null)
    } else {
      null
    }
    val categorie = if (data.categorieId != null) {
      categorieRepository.findById(data.categorieId.toInt()).orElse(null)
    } else {
      null
    }
    val fabriquant = if (data.fabriquantId != null) {
      fabriquantRepository.findById(data.fabriquantId.toInt()).orElse(null)
    } else {
      null
    }
    val forme = if (data.formeId != null) {
      formeRepository.findById(data.formeId.toInt()).orElse(null)
    } else {
      null
    }
    val fournisseur = if (data.fournisseurId != null) {
      fournisseurRepository.findById(data.fournisseurId.toInt()).orElse(null)
    } else {
      null
    }

    val inventaire = Inventaire().apply {
      this.rayon = rayon
      this.categorie = categorie
      this.fabriquant = fabriquant
      this.forme = forme
      this.fournisseur = fournisseur
      this.employe = employe
      this.supprimer = 0
      this.dateDebut = LocalDateTime.now()
      etat = Inventaire.INVENTAIRE_EN_COURS
    }

    val savedInventaire = inventaireRepository.save(inventaire)

    return savedInventaire
  }

  @Transactional
  fun cloturerInventaire(inventaireId: Long): Inventaire {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    inventaire.etat = "cloturer"
//    inventaire.dateFin = LocalDateTime.now()

    return inventaireRepository.save(inventaire)
  }

  @Transactional
  fun mettreAJourInventaire(data: InventaireUpdateRequestDto): Inventaire {
    val inventaire = inventaireRepository.findById(data.id.toInt()).get()
    var employe = userUtils.getCurrentEmploye()
    data.produitList.forEach { produit ->
      var enRayon = enRayonRepository.findById(produit.rayonId.toString()).get()
      if (produitInventorieRepository.findByInventaireAndEnRayon(inventaire, enRayon) != null) {
        var produitInventaire = produitInventorieRepository.findByInventaireAndEnRayon(inventaire, enRayon)
        produitInventaire?.stockValide = produit.quantiteReel
        produitInventaire?.stockAvant = produit.quantiteSysteme
        produitInventaire?.employe = employe
        produitInventorieRepository.save(produitInventaire!!)
      } else {
        var produitInventaire = ProduitInventaire().apply {
          this.inventaire = inventaire
          this.enRayon = enRayon
          this.employe = employe
          this.stockValide = produit.quantiteReel
          this.stockAvant = produit.quantiteSysteme
          statut = Inventaire.INVENTAIRE_EN_COURS
          dateDebut = LocalDateTime.now()
        }
        produitInventorieRepository.save(produitInventaire)
      }
    }

    return inventaireRepository.save(inventaire)
  }

  @Transactional
  fun valideProductToInventory(data: InventaireOneProductUpdateRequestDto): ProduitInventaire {
    val inventaire = inventaireRepository.findById(data.id!!.toInt()).get()
    var employe = userUtils.getCurrentEmploye()
    var enRayon = enRayonRepository.findById(data.rayonId.toString()).get()


    val existingProduitInventaire = produitInventorieRepository.findByInventaireAndEnRayon(inventaire, enRayon)

    if (existingProduitInventaire != null) {
      when (existingProduitInventaire.statut) {
        Inventaire.INVENTAIRE_CLOTURER -> {
          existingProduitInventaire.apply {
            this.employe = employe
            this.statut = Inventaire.INVENTAIRE_EN_COURS
            this.dateFin = LocalDateTime.now()
          }
        }

        Inventaire.INVENTAIRE_EN_COURS -> {
          existingProduitInventaire.apply {
            this.employe = employe
            this.stockValide = data.quantiteReel
            this.stockAvant = data.quantiteSysteme
            this.statut = Inventaire.INVENTAIRE_CLOTURER
            this.dateFin = LocalDateTime.now()
          }
        }

        else -> {
          existingProduitInventaire.apply {
            this.employe = employe
            this.stockValide = data.quantiteReel
            this.stockAvant = data.quantiteSysteme
            this.statut = Inventaire.INVENTAIRE_CLOTURER
            this.dateFin = LocalDateTime.now()
            this.dateDebut = LocalDateTime.now()
          }
        }
      }
      return produitInventorieRepository.save(existingProduitInventaire)
    } else {
      val produitInventaire = ProduitInventaire().apply {
        this.inventaire = inventaire
        this.enRayon = enRayon
        this.employe = employe
        this.stockValide = data.quantiteReel
        this.stockAvant = data.quantiteSysteme
        this.statut = Inventaire.INVENTAIRE_CLOTURER
        this.dateDebut = LocalDateTime.now()
        this.dateFin = LocalDateTime.now()
      }
      return produitInventorieRepository.save(produitInventaire)
    }
  }

  @Transactional
  fun invalideProductToInventory(id: String): Map<String, Any?> {
    val inventaire = produitInventorieRepository.findById(id!!.toInt()).get()
    var currentUser = userUtils.getCurrentEmploye()
    produitInventorieRepository.delete(inventaire)
    return mapOf(
      "message" to "Inventaire supprimé avec succès"
    )
  }

  fun listerInventaires(pageable: Pageable): Page<Inventaire> {
    return inventaireRepository.findAll(pageable)
  }

  fun listerInventairesCustom(pageable: Pageable): Page<Map<String, Any?>> {
    return inventaireRepository.findAll(pageable).map { inventaire ->
      var produitInventaireList = produitInventorieRepository.findByInventaire(inventaire)
      var totalProduits = 0
      var totalProduitsExcedent = 0
      var totalProduitsManquant = 0
      var totalProduitsNeutre = 0
      var totalProduitsEcart = 0

      var totalProduitsPrice = 0
      var totalProduitsPriceExcedent = 0
      var totalProduitsPriceManquant = 0
      var totalProduitsPriceNeutre = 0
      var totalProduitsPriceEcart = 0

      produitInventaireList.forEach { produit ->
        if (produit.stockAvant == produit.stockValide) {

        } else if (produit.stockAvant!! > produit.stockValide!!) {
          totalProduitsManquant += (produit.stockValide!! - produit.stockAvant!!)
          totalProduitsPriceManquant += (produit.enRayon?.prixAchat!! * (produit.stockValide!! - produit.stockAvant!!))
        } else {
          totalProduitsExcedent += -(produit.stockValide!! - produit.stockAvant!!)
          totalProduitsPriceExcedent += (produit.enRayon?.prixAchat!! * -(produit.stockValide!! - produit.stockAvant!!))
        }
        totalProduits += totalProduitsExcedent - totalProduitsManquant
        totalProduitsPriceNeutre = totalProduitsPriceManquant + totalProduitsPriceExcedent
      }

      totalProduitsPriceEcart = -totalProduitsPriceManquant + totalProduitsPriceExcedent
      totalProduitsEcart = totalProduitsManquant + totalProduitsExcedent
      mapOf(
        "id" to inventaire.id,
        "etat" to inventaire.etat,
        "dateDebut" to inventaire.dateDebut,
        "dateFin" to inventaire.dateFin,
        "employe" to inventaire.employe?.user?.username,
        "rayon" to inventaire.rayon?.nom,
        "categorie" to inventaire.categorie?.nom,
        "fabriquant" to inventaire.fabriquant?.nom,
        "forme" to inventaire.forme?.nom,
        "fournisseur" to inventaire.fournisseur?.nom,
        "commentaire" to inventaire.commentaire,
        "totalProduitsManquant" to totalProduitsManquant,
        "totalProduitsExcedent" to totalProduitsExcedent,
        "totalProduitsEcart" to totalProduitsEcart,
      )
    }
  }

  @Transactional
  fun listerProduitsParInventaire(inventaireId: Long, pageable: Pageable): Page<ProduitInventaire> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    return produitInventorieRepository.findByInventaire(inventaire, pageable)
  }

  @Transactional
  fun listerProduitsParInventaireAsMap(
    search: String?,
    inventaireId: String,
    pageable: Pageable
  ): Page<Map<String, Any?>> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    val produitsPage = if (search!=null) {
      val produitList = produitRepository.findByNomContaining(search).map { it.id }
      val enRayonList = enRayonRepository.findAllByProduitIdInAndSupprimer(produitList)
      produitInventorieRepository.findByInventaireAndEnRayonIn(inventaire, enRayonList, pageable)
    } else {
      produitInventorieRepository.findByInventaire(inventaire, pageable)
    }

    return produitsPage!!.map { produit ->
      val active = when (produit.statut) {
        Inventaire.INVENTAIRE_EN_COURS -> true
        Inventaire.INVENTAIRE_CLOTURER -> false
        else -> true
      }
      var produitData = produitRepository.findById(produit.enRayon?.produitId!!).get()
      mapOf(
        "produitInventaireId" to produit.id,
        "id" to produitData.id,
        "rayonId" to produit.enRayon!!.id,
        "rayon" to produit.enRayon!!,
        "dateLivraison" to produit.enRayon?.dateLivraison,
        "datePeremption" to produit.enRayon?.datePeremption,
        "type" to produit.type,
        "nom" to produitData?.nom,
        "isActive" to active,
        "quantiteSysteme" to produit.stockAvant,
        "quantiteReelle" to produit.stockValide,
        "comparaison" to (produit?.stockAvant?.minus(produit?.stockValide!!))
      )
    }
  }

  @Transactional
  fun getInfoProduitsInventaire(inventaireId: String): Map<String, Any?> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())?.get()
    var produitInventaire = produitInventorieRepository.findByInventaire(inventaire!!)
    var totalProduits = 0
    var totalProduitsExcedent = 0
    var totalProduitsManquant = 0
    var totalProduitsNeutre = 0
    var totalProduitsEcart = 0

    var totalProduitsPrice = 0
    var totalProduitsPriceExcedent = 0
    var totalProduitsPriceManquant = 0
    var totalProduitsPriceNeutre = 0
    var totalProduitsPriceEcart = 0

    produitInventaire.forEach { produit ->
      if (produit.stockAvant == produit.stockValide) {

      } else if (produit.stockAvant!! > produit.stockValide!!) {
        totalProduitsManquant += (produit.stockValide!! - produit.stockAvant!!)
        totalProduitsPriceManquant += (produit.enRayon?.prixAchat!! * (produit.stockValide!! - produit.stockAvant!!))
      } else {
        totalProduitsExcedent += -(produit.stockValide!! - produit.stockAvant!!)
        totalProduitsPriceExcedent += (produit.enRayon?.prixAchat!! * -(produit.stockValide!! - produit.stockAvant!!))
      }
      totalProduits += totalProduitsExcedent - totalProduitsManquant
      totalProduitsPriceNeutre = totalProduitsPriceManquant + totalProduitsPriceExcedent
    }

    totalProduitsPriceEcart = -totalProduitsPriceManquant + totalProduitsPriceExcedent
    totalProduitsEcart = totalProduitsManquant + totalProduitsExcedent

    return mapOf(
      "totalProduits" to totalProduits,
      "totalProduitsExcedent" to totalProduitsExcedent,
      "totalProduitsManquant" to totalProduitsManquant,
      "totalProduitsNeutre" to totalProduitsNeutre,
      "totalProduitsEcart" to -totalProduitsEcart,
      "totalProduitsPrice" to totalProduitsPrice,
      "totalProduitsPriceExcedent" to totalProduitsPriceExcedent,
      "totalProduitsPriceManquant" to totalProduitsPriceManquant,
      "totalProduitsPriceNeutre" to totalProduitsPriceNeutre,
      "totalProduitsPriceEcart" to -totalProduitsPriceEcart
    )
  }

  @Transactional
  fun listerProduitsParInventaireAvecFiltre(
    inventaireId: String,
    pageable: Pageable,
    filtre: String? = null
  ): Page<Map<String, Any?>> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    val produitsPage = produitInventorieRepository.findByInventaire(inventaire, pageable)

    val filteredProduits = produitsPage.content.filter { produit ->
      when (filtre) {
        "equal" -> (produit.stockAvant ?: 0) == (produit.stockValide ?: 0)
        "greater" -> (produit.stockAvant ?: 0) > (produit.stockValide ?: 0)
        "less" -> (produit.stockAvant ?: 0) < (produit.stockValide ?: 0)
        else -> true // No filter applied
      }
    }

    return PageImpl(filteredProduits.map { produit ->
      val active = when (produit.statut) {
        Inventaire.INVENTAIRE_EN_COURS -> true
        Inventaire.INVENTAIRE_CLOTURER -> false
        else -> true
      }
      val produitData = produitRepository.findById(
        produit.enRayon?.produitId
          ?: throw IllegalArgumentException("Produit ID is null")
      ).get()
      mapOf(
        "produitInventaireId" to produit.id,
        "id" to produitData.id,
        "rayonId" to (produit.enRayon?.id ?: throw IllegalArgumentException("Rayon ID is null")),
        "rayon" to produit.enRayon!!,
        "dateLivraison" to produit.enRayon?.dateLivraison,
        "datePeremption" to produit.enRayon?.datePeremption,
        "type" to produit.type,
        "nom" to produitData.nom,
        "isActive" to active,
        "quantiteSysteme" to (produit.stockAvant ?: 0),
        "quantiteReelle" to (produit.stockValide ?: 0),
        "comparaison" to ((produit.stockAvant ?: 0) - (produit.stockValide ?: 0))
      )
    }, pageable, produitsPage.totalElements)
  }

  @Transactional
  fun terminerInventaire(inventaireId: Long, commentaire: String): Inventaire {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    inventaire.etat = Inventaire.INVENTAIRE_TERMINER
    inventaire.commentaire = commentaire
    inventaire.dateFin = LocalDateTime.now()
    return inventaireRepository.save(inventaire)
  }

}
