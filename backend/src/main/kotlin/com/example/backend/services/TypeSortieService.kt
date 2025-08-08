package com.example.backend.services

import com.example.backend.dtos.SortieDetailDto
import com.example.backend.dtos.TypeSortieDto
import com.example.backend.models.ProduitDetail
import com.example.backend.models.SortieStock
import com.example.backend.models.TypeSortie
import com.example.backend.repositories.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull

@Service
class TypeSortieService(
  private val produitDetailRepository: ProduitDetailRepository,
  private val sortieStockRepository: SortieStockRepository,
  private val typeSortieRepository: TypeSortieRepository,
  private val enRayonRepository: EnRayonRepository,
  private val produitRepository: ProduitRepository
) {

  fun getTypeSortiePageable(
    nom: String?,
    pageable: Pageable
  ): Page<Map<String, Any?>> {
    val specification = TypeSortieRepository.filterTypeSortie(nom)
    return typeSortieRepository.findAll(specification, pageable)
      .map { typeSortie ->
        mapOf(
          "id" to typeSortie.id,
          "nom" to typeSortie.nom
        )
      }
  }


  fun addTypeSortiel(sortie: TypeSortieDto): TypeSortie {
    if (sortie.id==0){
      var newTypeSortie = TypeSortie().apply {
        this.nom = sortie.nom
        this.description = sortie.description
      }
      newTypeSortie = typeSortieRepository.save(newTypeSortie)
      return newTypeSortie
    }
    else {
      val typeSortie = typeSortieRepository.findById(sortie.id!!.toInt()).getOrNull()
      typeSortie!!.nom = sortie.nom
      typeSortie.description = sortie.description
      return typeSortieRepository.save(typeSortie!!)
    }
  }
}
