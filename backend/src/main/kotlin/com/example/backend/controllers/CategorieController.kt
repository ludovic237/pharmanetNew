package com.example.backend.controllers

import com.example.backend.models.Categorie
import com.example.backend.services.CategorieService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategorieController(private val categorieService: CategorieService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createCategorie(@RequestBody categorie: Categorie): ResponseEntity<Categorie> =
    ResponseEntity.status(HttpStatus.CREATED).body(categorieService.createCategorie(categorie))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllCategories(): ResponseEntity<List<Categorie>> =
    ResponseEntity.ok(categorieService.getAllCategories())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable")
  fun getAllCategoriesPagraable(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Categorie>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"))
    return ResponseEntity.ok(categorieService.getAllCategoriesPage(pageable))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateCategorie(@PathVariable id: Int, @RequestBody categorie: Categorie): ResponseEntity<Categorie> =
    ResponseEntity.ok(categorieService.updateCategorie(id, categorie))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteCategorie(@PathVariable id: Int): ResponseEntity<Void> {
    categorieService.deleteCategorie(id)
    return ResponseEntity.noContent().build()
  }
}
