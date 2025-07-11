package com.example.backend.services

import com.example.backend.models.Rayon
import com.example.backend.repositories.ProduitDetailRepository
import com.example.backend.repositories.RayonRepository
import com.example.backend.repositories.SortieStockRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class SortieStockService(
  private val produitDetailRepository: ProduitDetailRepository,
  private val sortieStockRepository: SortieStockRepository
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
        mapOf(
          "id" to sortieStock.id,
          "nomProduit" to sortieStock.enRayon?.produit?.nom,
          "formeProduit" to sortieStock.enRayon?.produit?.forme,
          "typeSortie" to sortieStock.typeSortie,
          "enRayonId" to sortieStock.enRayon?.id,
          "produitDetailId" to sortieStock.detailId,
          "produitDetailNom" to produitDetail?.nom,      // Safely access the name
          "produitDetailPrix" to produitDetail?.prix,   // Corrected key and safe access
          "quantite" to sortieStock.quantite,
          "dateSortie" to sortieStock.dateSortie
        )
      }
  }


}
