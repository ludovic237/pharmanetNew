package com.example.backend.controllers

import com.example.backend.models.Magasin
import com.example.backend.services.MagasinService
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
