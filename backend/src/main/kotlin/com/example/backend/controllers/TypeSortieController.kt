package com.example.backend.controllers

import com.example.backend.dtos.SortieDetailDto
import com.example.backend.dtos.TypeSortieDto
import com.example.backend.models.Forme
import com.example.backend.models.ProduitDetail
import com.example.backend.models.TypeSortie
import com.example.backend.services.FormeService
import com.example.backend.services.SortieStockService
import com.example.backend.services.TypeSortieService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/type-sortie")
class TypeSortieController(
  private val typeSortieService: TypeSortieService,
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getTypeSortiePageable(
    @RequestParam(required = false) nom: String?,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "desc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val result = typeSortieService.getTypeSortiePageable(nom, pageable)
    return ResponseEntity.ok(result)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/save")
  fun getSortieStockPageable(
    @RequestBody sortie: TypeSortieDto
  ): ResponseEntity<TypeSortie> {
    val result = typeSortieService.addTypeSortiel(sortie)
    return ResponseEntity.ok(result)
  }

}
