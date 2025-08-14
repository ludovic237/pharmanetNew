package com.example.backend.services

import com.example.backend.dtos.ProduitDetailDto
import com.example.backend.models.Produit
import com.example.backend.models.ProduitDetail
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ProduitDetailService(
  private val userUtils: UserUtils,
  private val produitDetailRepository: ProduitDetailRepository,
  private val retourProduitRepository: RetourProduitRepository,
  private val produitRetourRepository: ProduitRetourRepository,
  private val produitCmdRepository: ProduitCmdRepository,
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
  private val fabriquantRepository: FabriquantRepository, private val caisseRepository: CaisseRepository
) {

  fun getProduitDetailsByName(nom: String): List<Map<String, Any?>> {
    if (nom.isBlank()) {
      return emptyList() // Retourne une liste vide si la recherche est vide
    }
    val produitsDetails = produitDetailRepository.findByNomContainingIgnoreCaseAndSupprimerIs(nom, 0)
    // On transforme la liste d'entités en liste de DTOs
    return produitsDetails.map { produitDetail ->
      mapOf(
        "id" to produitDetail.id,
        "nom" to produitDetail.nom,
        "reference" to produitDetail.reference,
        "stock" to produitDetail.stock,
        "prix" to produitDetail.prix,
        "grossisteList" to produitDetail.grossisteList,
        "stockMin" to produitDetail.stockMin,
        "stockMax" to produitDetail.stockMax
        // Ajoutez ici d'autres champs que vous souhaitez retourner
      )
    }
  }

  fun getProduitDetailsByNamePageable(nom: String?, pageable: Pageable): Page<Map<String, Any?>> {
    if (nom!!.isBlank()) {
      return Page.empty(pageable) // Retourne une page vide si la recherche est vide
    }
    // Appelle la nouvelle méthode paginée du repository
    val produitsDetailsPage = produitDetailRepository.findByNomContainingIgnoreCaseAndSupprimer(nom, 0, pageable)

    // La fonction .map sur un objet Page transforme son contenu tout en conservant les informations de pagination.
    return produitsDetailsPage.map { produitDetail ->
      var produitGrossiste = produitDetail.id?.let { produitRepository.findByDetailId(it) }?.map { produit ->
        mapOf(
          "nom" to produit.nom,
          "stock" to produit.stock
        )
      }
      mapOf(
        "id" to produitDetail.id,
        "nom" to produitDetail.nom,
        "reference" to produitDetail.reference,
        "stock" to produitDetail.stock,
        "prix" to produitDetail.prix,
        "reductionMax" to produitDetail.reductionMax,
        "grossisteList" to produitGrossiste,
        "stockMin" to produitDetail.stockMin,
        "stockMax" to produitDetail.stockMax
      )
    }
  }

  fun getProduitDetailsPageable(pageable: Pageable): Page<Map<String, Any?>> {
    val specification = ProduitDetailRepository.filterProduitDetail(0)
    val produitsDetailsPage = produitDetailRepository.findAll(specification,pageable)
    return produitsDetailsPage.map { produitDetail ->
      var produitGrossiste = produitDetail.id?.let { produitRepository.findByDetailId(it) }?.map { produit ->
        mapOf(
          "nom" to produit.nom,
          "stock" to produit.stock
        )
      }
      mapOf(
        "id" to produitDetail.id,
        "nom" to produitDetail.nom,
        "reference" to produitDetail.reference,
        "stock" to produitDetail.stock,
        "prix" to produitDetail.prix,
        "reductionMax" to produitDetail.reductionMax,
        "grossisteList" to produitGrossiste,
        "stockMin" to produitDetail.stockMin,
        "stockMax" to produitDetail.stockMax
      )
    }
  }

  @Transactional
  fun createProduitDetail(produitDto: ProduitDetailDto?): ProduitDetail {
    var produitDetail = ProduitDetail().apply {
      this.nom = (produitDto!!.nom)
      this.reference = (produitDto.reference)
      this.stock = (produitDto.stock)
      this.stockMax = (produitDto.stockMax)
      this.stockMin = (produitDto.stockMin)
      this.prix = (produitDto.prix!!.toInt())
      this.reductionMax = (produitDto.reductionMax)
      this.grossisteList = (produitDto.magasinId.toString())
    }

    // Save produit
    produitDetail = produitDetailRepository.save(produitDetail)
    produitDto!!.data!!.forEach { produit ->
      var produit = produitRepository.findById(produit.produitId!!.toInt()).get()
      produit.detailId = produitDetail.id
      produit.contenuDetail = produitDto.stock.toString()
      produitRepository.save(produit)
    }
    return produitDetail
  }

  fun getProduitDetailsInfo(produitDetailId: String): Map<String, Any?> {
    val produitDetail = produitDetailRepository.findById(produitDetailId.toInt()).get()

    var produitGrossiste = produitDetail.id?.let { produitRepository.findByDetailId(it) }?.map { produit ->
      mapOf(
        "id" to produit.id,
        "nom" to produit.nom,
        "stock" to produit.stock,
        "contenuDetail" to produit.contenuDetail,
      )
    }

    return mapOf(
      "id" to produitDetail.id,
      "nom" to produitDetail.nom,
      "reference" to produitDetail.reference,
      "stock" to produitDetail.stock,
      "prix" to produitDetail.prix,
      "reductionMax" to produitDetail.reductionMax,
      "grossisteList" to produitGrossiste,
      "stockMin" to produitDetail.stockMin,
      "stockMax" to produitDetail.stockMax
    )
  }

  fun removeParentDetail(productId: String, productDetailId: String): Produit {
    var produit = produitRepository.findByIdAndDetailId(productId.toInt(), productDetailId.toInt())
    produit.detailId = null
    produit.contenuDetail = null
    produit = produitRepository.save(produit)
    return produit
  }

  @Transactional
  fun removeProduitDetail(productDetailId: String): ProduitDetail {
    var produitEntuty = produitDetailRepository.findById(productDetailId.toInt()).get()
    produitEntuty.supprimer = 1
    produitEntuty = produitDetailRepository.save(produitEntuty)

    produitRepository.findByDetailId(productDetailId.toInt()).forEach { produit ->
      produit.detailId = null
      produitRepository.save(produit)
    }
    return produitEntuty
  }

  @Transactional
  fun updateProduitDetail(produitDetailId: String, produitDto: ProduitDetailDto?): ProduitDetail {

    var produitDetail = produitDetailRepository.findById(produitDetailId.toInt()).get()
    produitDetail.apply {
      this.nom = (produitDto!!.nom)
      this.reference = (produitDto.reference)
      this.stock = (produitDto.stock)
      this.stockMax = (produitDto.stockMax)
      this.stockMin = (produitDto.stockMin)
      this.prix = (produitDto.prix!!.toInt())
      this.reductionMax = (produitDto.reductionMax)
      this.grossisteList = (produitDto.magasinId.toString())
    }

    // Save produit
    produitDetail = produitDetailRepository.save(produitDetail)

    produitDto!!.data!!.forEach { produit ->
      var produit = produitRepository.findById(produit.produitId!!.toInt()).get()
      produit.detailId = produitDetail.id
      produit.contenuDetail = produitDto.stock.toString()
      produitRepository.save(produit)
    }
    return produitDetail
  }

}
