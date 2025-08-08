package com.example.backend.services

import com.example.backend.dtos.EnRayonDto
import com.example.backend.dtos.ProduitEnRayonDto
import com.example.backend.models.EnRayon
import com.example.backend.models.Rayon
import com.example.backend.models.SortieStock
import com.example.backend.repositories.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class EnRayonService(
  private val formeRepository: FormeRepository,
  private val sortieStockRepository: SortieStockRepository,
  private val typeSortieRepository: TypeSortieRepository,
  private val produitRepository: ProduitRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val enRayonRepository: EnRayonRepository,
  private val rayonRepository: RayonRepository,
  private val produitDetailRepository: ProduitDetailRepository,
) {

  @Transactional
  fun decrementerStock(enRayonId: Int, produitDetailId: Int):Map<String,Any?> {
    val enRayonOptional = enRayonRepository.findById(enRayonId.toString())
    if (enRayonOptional.isEmpty) {
      return mapOf(
        "messsage" to "Produit EnRayon introuvable avec l'ID: $enRayonId"
      )
    }

    var produit = produitRepository.findById(enRayonOptional.get().produitId?: 0).get()
    val produitDetailOptional = produitDetailRepository.findById(produitDetailId)
    if (produitDetailOptional.isEmpty) {
      return mapOf(
        "messsage" to "Produit Detail introuvable avec l'ID: $produitDetailId"
      )
    }
    println("produit.detailId : ${produit.detailId}")
    println("produitDetailId : ${produitDetailId}")
    val enRayon = enRayonOptional.get()
    println("enRayon.quantite : ${enRayon.quantite}")
    if (enRayon.quantite!! > 0 && produit?.detailId == produitDetailId) {
      val sortieStock = SortieStock().apply {
        this.enRayon = enRayon
        this.quantite = 1
        this.detailId = produitDetailId.toString()
        this.typeSortie = typeSortieRepository.findById(1).get()
        this.dateSortie = LocalDateTime.now()
      }
      sortieStockRepository.save(sortieStock)
      val produitDetail = produitDetailOptional.get()

      enRayon.quantiteRestante = enRayon.quantiteRestante?.minus(1) ?: 0
      enRayonRepository.save(enRayon)

      produit.stock = produit.stock?.minus(1) ?: 0
      produitRepository.save(produit)

      produitDetail.stock = produitDetail.stock!! + produit.contenuDetail!!.toInt()
      produitDetailRepository.save(produitDetail)

      return mapOf(
        "messsage" to "Succès : le stock a été décrémenté avec succès et la sortie de stock a été enregistrée"
      )
    }
    else {
      return  mapOf(
        "messsage" to "Erreur : La quantité du stock total du produit est inférieure ou égale à zéro"
      )
    }

  }

  @Transactional
  fun ajouterProduitsEnRayon(produits: List<ProduitEnRayonDto>): List<EnRayon> {
    return produits.map { produitDto ->
      val produit = produitRepository.findById(produitDto.produitId.toInt())
        .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitDto.produitId}") }

      val fournisseur = fournisseurRepository.findById(produitDto.fournisseurId!!.toInt())
        .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitDto.produitId}") }

      val rayon = rayonRepository.findById(produitDto.rayonId!!.toInt())
        .orElseThrow { RuntimeException("Rayon introuvable avec l'ID: ${produitDto.rayonId}") }

      val dateTimeNow = LocalDateTime.now()
      val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
      val formattedDateTimeNow = dateTimeNow.format(formatter)

      val enRayon = EnRayon().apply {
        this.id = "${produit.id}${fournisseur.code}${formattedDateTimeNow}"
        this.produitId = produit.id
        this.fournisseur = fournisseur
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
      val enRayon = enRayonRepository.findById(produitDto.enRayonId!!.toString())
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
    if (produitId < 700) {
      produitDetailRepository.findById(produitId).get()
      val p = produitDetailRepository.findByIdAndStockGreaterThanAndSupprimer(produitId)
      var data = mutableListOf<Map<String, Any?>>()
      var listeGrosssiste = p.grossisteList!!.split("-").map { grossiste ->
        produitRepository.findById(grossiste.toInt())
      }
      data.add(
        mapOf(
          "id" to p.id,
          "nom" to p.nom,
          "reference" to p.reference,
          "quantiteRestante" to p.stock,
          "quantite" to p.stock,
          "prixVente" to p.prix,
          "dateLivraison" to "",
          "datePeremption" to "",
          "grossistes" to listeGrosssiste,
          "reductionMax" to p.reductionMax,
          "reduction" to p.reductionMax,
          "type" to "detail"
        )
      )
      return data
    } else {
      val produit = produitRepository.findById(produitId).orElseThrow()
      val enRayonList = enRayonRepository.findByProduitIdAndQuantiteRestanteGreaterThanAndSupprimer(produit.id!!)
      var data = enRayonList.map { enRayon->
        val p = produitRepository.findById(enRayon.produitId!!).get()
        mapOf(
          "id" to p?.id,
          "rayonId" to enRayon.id,
          "quantite" to enRayon.quantite,
          "quantiteRestante" to enRayon.quantiteRestante,
          "dateLivraison" to enRayon.dateLivraison,
          "datePeremption" to enRayon.datePeremption,
          "ean13" to p?.ean13,
          "nom" to p?.nom,
          "stock" to p?.stock,
          "prixVente" to enRayon.prixVente,
          "etat" to p?.etat,
          "reductionMax" to p?.reductionMax,
          "reduction" to p?.reductionMax,
         /* "categorie" to mapOf(
            "id" to p?.categorie?.id,
            "nom" to p?.categorie?.nom
          ),
          "forme" to mapOf(
            "id" to p?.forme?.id,
            "code" to p?.forme?.code,
            "nom" to p?.forme?.nom
          ),
          "fabriquant" to mapOf(
            "id" to p?.fabriquant?.id,
            "code" to p?.fabriquant?.code,
            "nom" to p?.fabriquant?.nom
          ),*/
          "rayon" to mapOf("id" to p?.rayon?.id),
          "etagere" to p?.etagere,
          /*"magasin" to mapOf(
            "id" to p?.magasin?.id,
            "code" to p?.magasin?.code,
            "nom" to p?.magasin?.nom
          ),*/
//          "createdAt" to p?.createdAt,
//          "updatedAt" to p?.updatedAt,
          "type" to "produit"
        )
      }
      return data
    }
  }


  @Transactional
  fun getProduitsWithDetailEnRayonParProduitIdt(produitId: Int, produitType: String): List<Map<String, Any?>> {
    val enRayonList = enRayonRepository.findByProduitIdAndSupprimer(produitRepository.findById(produitId).get().id!!)

    return enRayonList.map { enRayon ->
      var produit = produitRepository.findById(enRayon.produitId!!.toInt()).get()
      val minReduction = minOf(produit?.reductionMax ?: 0, enRayon.reduction ?: 0)
      mapOf(
        "id" to enRayon.id,
        "produit" to mapOf(
          "id" to produit?.id,
          "ean13" to produit?.ean13,
          "nom" to produit?.nom,
          "stock" to produit?.stock,
          "etat" to produit?.etat,
          "reductionMax" to produit?.reductionMax,
          "categorie" to mapOf(
            "id" to produit?.categorie?.id,
            "nom" to produit?.categorie?.nom
          ),
          "forme" to mapOf(
            "id" to produit?.forme?.id,
            "code" to produit?.forme?.code,
            "nom" to produit?.forme?.nom
          ),
          "fabriquant" to mapOf(
            "id" to produit?.fabriquant?.id,
            "code" to produit?.fabriquant?.code,
            "nom" to produit?.fabriquant?.nom
          ),
          "rayon" to mapOf(
            "id" to produit?.rayon?.id
          ),
          "etagere" to produit?.etagere,
          "magasin" to mapOf(
            "id" to produit?.magasin?.id,
            "code" to produit?.magasin?.code,
            "nom" to produit?.magasin?.nom
          ),
//          "createdAt" to produit?.createdAt,
//          "updatedAt" to produit?.updatedAt
        ),
        "rayon" to enRayon?.let { mapOf("id" to it.id) },
        "fournisseur" to mapOf(
          "id" to enRayon.fournisseur?.id,
          "code" to enRayon.fournisseur?.code,
          "nom" to enRayon.fournisseur?.nom,
          "statut" to enRayon.fournisseur?.statut,
          "supprimer" to enRayon.fournisseur?.supprimer
        ),
//        "unite" to enRayon.unite,
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
  fun getProduitsEnRayonParNomProduit(nomProduit: String): List<EnRayon> {
    var produits = produitRepository.findByNomContaining(nomProduit)
    return  enRayonRepository.findByProduitIdInAndSupprimer(produits.map { it.id!! }, 0)
  }

  @Transactional
  fun getProduitsEnRayonParNomRayon(nomRayon: String): List<Rayon>{
    var rayon = rayonRepository.findByNomContainingIgnoreCase(nomRayon)
    return  rayon!!
  }

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
    val enRayon = enRayonRepository.findById(produitDto.enRayonId!!.toString())
      .orElseThrow { RuntimeException("Produit en rayon introuvable avec l'ID: ${produitDto.enRayonId}") }
    val produit = produitRepository.findById(enRayon.produitId!!.toInt()).get()
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
    return enRayonRepository.findAll(specification, pageable)
      .map { enRayon ->
        val produit = produitRepository.findById(enRayon.produitId!!.toInt()).get()
        mapOf(
          "id" to enRayon.id,
          "produitId" to produit!!.id,
          "produitNom" to produit!!.nom,
          "rayonId" to produit.rayon?.id,
          "rayonNom" to produit.rayon?.nom,
          "fournisseurId" to enRayon.fournisseur!!.id,
          "fournisseurNom" to enRayon.fournisseur!!.nom,
//          "unite" to enRayon.unite,
          "commandeId" to enRayon.commande?.id,
          "commandeRef" to enRayon.commande?.ref,
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
