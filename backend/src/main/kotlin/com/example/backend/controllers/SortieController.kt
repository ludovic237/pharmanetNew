package com.example.backend.controllers

import com.example.backend.dtos.CommandePageableCustomlDto
import com.example.backend.dtos.SortieDetailDto
import com.example.backend.models.Forme
import com.example.backend.models.ProduitDetail
import com.example.backend.services.FormeService
import com.example.backend.services.SortieStockService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/sortie-stock")
class SortieController(private val sortieStockService: SortieStockService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getSortieStockPageable(
    @RequestParam(required = false) nomProduit: String?,
    @RequestParam(required = false) typeSortie: String?,
    @RequestParam(required = false) enRayonId: String?,
    @RequestParam(required = false) produitDetailId: String?,
    @RequestParam(required = false) search: String?,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "desc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateSortie"))
    val enRayonIdLong = enRayonId?.toLongOrNull() ?: 0
    val produitDetailIdLong = produitDetailId?.toLongOrNull() ?: 0
    val result =
      sortieStockService.getSortieStockPageable(nomProduit, typeSortie, enRayonIdLong, produitDetailIdLong, pageable)
    return ResponseEntity.ok(result)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/product")
  fun getSortieStockPageableProductRange(
    @RequestParam(required = false) nomProduit: String?,
    @RequestParam(required = false) produitId: String?,
    @RequestParam(required = false) startDate: String?,
    @RequestParam(required = false) endDate: String?,
    @RequestParam(required = false) typeSortie: String?,
    @RequestParam(required = false) enRayonId: String?,
    @RequestParam(required = false) produitDetailId: String?,
    @RequestParam(required = false) search: String?,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "desc") direction: String
  ): ResponseEntity<CommandePageableCustomlDto> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateSortie"))
    val enRayonIdLong = enRayonId?.toLongOrNull() ?: 0
    val produitDetailIdLong = produitDetailId?.toLongOrNull() ?: 0
    val result = sortieStockService.getSortieStockPageableProductRange(
      nomProduit,
      produitId,
      startDate,
      endDate,
      typeSortie,
      enRayonIdLong,
      produitDetailIdLong,
      pageable
    )
    return ResponseEntity.ok(result)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/save")
  fun getSortieStockPageable(
    @RequestBody sortie: SortieDetailDto
  ): ResponseEntity<ProduitDetail> {
    val result = sortieStockService.addProduitDetail(sortie)
    return ResponseEntity.ok(result)
  }

}
