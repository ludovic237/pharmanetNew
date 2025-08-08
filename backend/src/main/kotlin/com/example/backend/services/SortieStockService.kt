package com.example.backend.services

import com.example.backend.dtos.SortieDetailDto
import com.example.backend.models.ProduitDetail
import com.example.backend.models.SortieStock
import com.example.backend.repositories.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull

@Service
class SortieStockService(
  private val produitDetailRepository: ProduitDetailRepository,
  private val sortieStockRepository: SortieStockRepository,
  private val enRayonRepository: EnRayonRepository,
  private val typeSortieRepository: TypeSortieRepository, private val produitRepository: ProduitRepository
) {

  fun getSortieStockPageable(
    nomProduit: String?,
    typeSortie: String?,
    enRayonId: Long?,
    produitDetailId: Long?,
    pageable: Pageable
  ): Page<Map<String, Any?>> {
    val specification = SortieStockRepository.filterSortieStock(nomProduit, typeSortie, enRayonId, produitDetailId)
    return sortieStockRepository.findAll(specification, pageable)
      .map { sortieStock ->
        val produitDetail = if (!sortieStock.detailId.isNullOrBlank()) {
          sortieStock.detailId?.toIntOrNull()?.let { id ->
            // Use findById which returns an Optional, and orElse(null) to avoid exceptions
            produitDetailRepository.findById(id).orElse(null)
          }
        } else {
          null
        }
        // Build the map cleanly in one place
        val enRayon = enRayonRepository.findById(sortieStock.enRayon!!.id!!).get()
        val produit = produitRepository.findById(enRayon.produitId!!).getOrNull()
        if (produit != null) {
          var nom = produit?.nom
          var id = produit?.id
          if (sortieStock.typeSortie!!.nom!! === "detail") {
            var produitDetail = produitDetailRepository.findById(sortieStock.enRayon!!.id!!.toInt()).get()
            nom = produitDetail.nom
            id = produitDetail.id
          }
          mapOf(
            "id" to sortieStock.id,
            "nomProduit" to nom,
//          "formeProduit" to forme,
            "typeSortie" to sortieStock.typeSortie,
            "enRayonId" to sortieStock.enRayon?.id,
            "produitDetailId" to sortieStock.detailId,
            "produitDetailNom" to produitDetail?.nom,      // Safely access the name
            "produitDetailPrix" to produitDetail?.prix,   // Corrected key and safe access
            "quantite" to sortieStock.quantite,
            "dateSortie" to sortieStock.dateSortie
          )
        } else {
          null
        }

      }
  }


  fun addProduitDetail(sortie: SortieDetailDto): ProduitDetail {
    var produitDetail = ProduitDetail()
    if (sortie.produitDetailId.toString() != "null" && sortie.produitDetailId.toString() != "null") {
      produitDetail = produitDetailRepository.findById(sortie.produitDetailId!!).get()
      produitDetail.stock = produitDetail.stock!! + sortie.enrayon?.sumOf { it.contenuDetail!!.toInt() * it.quantite!! }!!
      produitDetail = produitDetailRepository.save(produitDetail)
    }
    sortie.enrayon?.forEach { enrayon ->
      if (enrayon.contenuDetail != "null" && enrayon.contenuDetail != null) {
        val produitEnRayon = enRayonRepository.findById(enrayon.rayonId!!).get()
        produitEnRayon.quantiteRestante = produitEnRayon.quantiteRestante!! - enrayon.quantite!!
        enRayonRepository.save(produitEnRayon)

        val produit = produitRepository.findById(produitEnRayon.produitId!!).get()
        produit.stock = produit.stock!! - enrayon.quantite
        produitRepository.save(produit)

        val sortieStock = SortieStock().apply {
          this.enRayon = produitEnRayon
          this.typeSortie = typeSortieRepository.findById(1).get()
          this.quantite = enrayon.quantite
          this.dateSortie = LocalDateTime.now()
          this.detailId = sortie.produitDetailId.toString()
          this.supprimer = 0
        }
        sortieStockRepository.save(sortieStock)
      } else {
        val produitEnRayon = enRayonRepository.findById(enrayon.rayonId!!).get()
        produitEnRayon.quantiteRestante = produitEnRayon.quantiteRestante!! - enrayon.quantite!!
        enRayonRepository.save(produitEnRayon)

        val produit = produitRepository.findById(produitEnRayon.produitId!!).get()
        produit.stock = produit.stock!! - enrayon.quantite!!
        produitRepository.save(produit)

        val sortieStock = SortieStock().apply {
          this.enRayon = produitEnRayon
          this.typeSortie = typeSortieRepository.findById(sortie.typeSortieId!!).get()
          this.quantite = enrayon.quantite
          this.dateSortie = LocalDateTime.now()
          this.supprimer = 0
        }
        sortieStockRepository.save(sortieStock)
      }

    }


    return produitDetail
  }

}
