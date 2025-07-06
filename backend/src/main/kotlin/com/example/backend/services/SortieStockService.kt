package com.example.backend.services

import com.example.backend.models.Rayon
import com.example.backend.repositories.RayonRepository
import com.example.backend.repositories.SortieStockRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service

@Service
class SortieStockService(private val sortieStockRepository: SortieStockRepository) {

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
        mapOf(
          "id" to sortieStock.id,
          "nomProduit" to sortieStock.enRayon?.produit?.nom,
          "typeSortie" to sortieStock.typeSortie,
          "enRayonId" to sortieStock.enRayon?.id,
          "produitDetailId" to sortieStock.detailId,
          "quantite" to sortieStock.quantite,
          "dateSortie" to sortieStock.dateSortie
        )
      }
  }


}
