package com.example.backend.controllers

import com.example.backend.models.Categorie
import com.example.backend.models.Magasin
import com.example.backend.services.MagasinService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/magasins")
class MagasinController(private val magasinService: MagasinService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createMagasin(@RequestBody magasin: Magasin): ResponseEntity<Magasin> =
    ResponseEntity.status(HttpStatus.CREATED).body(magasinService.createMagasin(magasin))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllMagasins(): ResponseEntity<List<Magasin>> =
    ResponseEntity.ok(magasinService.getAllMagasins())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable")
  fun getAllMagasinsPagraable(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Magasin>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"))
    return ResponseEntity.ok(magasinService.getAllMagasinsPage(pageable))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateMagasin(@PathVariable id: Int, @RequestBody magasin: Magasin): ResponseEntity<Magasin> =
    ResponseEntity.ok(magasinService.updateMagasin(id, magasin))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteMagasin(@PathVariable id: Int): ResponseEntity<Void> {
    magasinService.deleteMagasin(id)
    return ResponseEntity.noContent().build()
  }
}
