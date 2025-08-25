package com.example.backend.controllers

import com.example.backend.models.Categorie
import com.example.backend.models.Forme
import com.example.backend.services.FormeService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/formes")
class FormeController(private val formeService: FormeService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createForme(@RequestBody forme: Forme): ResponseEntity<Forme> =
    ResponseEntity.status(HttpStatus.CREATED).body(formeService.createForme(forme))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllFormes(): ResponseEntity<List<Forme>> =
    ResponseEntity.ok(formeService.getAllFormes())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable")
  fun getAllFormesPagraable(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Forme>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "id"))
    return ResponseEntity.ok(formeService.getAllFormesRange(pageable))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateForme(@PathVariable id: Int, @RequestBody forme: Forme): ResponseEntity<Forme> =
    ResponseEntity.ok(formeService.updateForme(id, forme))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteForme(@PathVariable id: Int): ResponseEntity<Void> {
    formeService.deleteForme(id)
    return ResponseEntity.noContent().build()
  }
}
