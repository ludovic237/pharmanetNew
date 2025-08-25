package com.example.backend.controllers

import com.example.backend.models.Categorie
import com.example.backend.models.Rayon
import com.example.backend.services.RayonService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/rayons")
class RayonController(private val rayonService: RayonService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createRayon(@RequestBody rayon: Rayon): ResponseEntity<Rayon> =
    ResponseEntity.status(HttpStatus.CREATED).body(rayonService.createRayon(rayon))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllRayons(): ResponseEntity<List<Rayon>> =
    ResponseEntity.ok(rayonService.getAllRayons())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable")
  fun getAllRayonsPagraable(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Rayon>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"))
    return ResponseEntity.ok(rayonService.getAllRayonsPage(pageable))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateRayon(@PathVariable id: Int, @RequestBody rayon: Rayon): ResponseEntity<Rayon> =
    ResponseEntity.ok(rayonService.updateRayon(id, rayon))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteRayon(@PathVariable id: Int): ResponseEntity<Void> {
    rayonService.deleteRayon(id)
    return ResponseEntity.noContent().build()
  }

}
