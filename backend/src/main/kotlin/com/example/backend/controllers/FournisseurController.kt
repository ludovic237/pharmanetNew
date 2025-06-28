package com.example.backend.controllers

import com.example.backend.models.Forme
import com.example.backend.models.Fournisseur
import com.example.backend.services.FormeService
import com.example.backend.services.FournisseurService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/fournisseurs")
class FournisseurController(private val fournisseurService: FournisseurService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createFournisseur(@RequestBody forme: Fournisseur): ResponseEntity<Fournisseur> =
    ResponseEntity.status(HttpStatus.CREATED).body(fournisseurService.createFournisseur(forme))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllFournisseurs(): ResponseEntity<List<Fournisseur>> =
    ResponseEntity.ok(fournisseurService.getAllFournisseurs())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateFournisseur(@PathVariable id: Int, @RequestBody forme: Fournisseur): ResponseEntity<Fournisseur> =
    ResponseEntity.ok(fournisseurService.updateFournisseur(id, forme))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteFournisseur(@PathVariable id: Int): ResponseEntity<Void> {
    fournisseurService.deleteFournisseur(id)
    return ResponseEntity.noContent().build()
  }
}
