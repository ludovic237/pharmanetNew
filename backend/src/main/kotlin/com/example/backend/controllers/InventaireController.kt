package com.example.backend.controllers

import com.example.backend.dtos.InventaireRequestDto
import com.example.backend.dtos.InventaireUpdateRequestDto
import com.example.backend.models.Inventaire
import com.example.backend.models.ProduitInventaire
import com.example.backend.models.User
import com.example.backend.services.InventaireService
import com.example.backend.services.UserService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/inventaire")
class InventaireController(
  private val inventaireService: InventaireService
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/create")
  fun creerInventaire(
    @RequestBody data: InventaireRequestDto
  ): ResponseEntity<Inventaire> {
    val inventaire = inventaireService.creerInventaire(data)
    return ResponseEntity.ok(inventaire)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/close/{id}")
  fun cloturerInventaire(@PathVariable id: Long): ResponseEntity<Inventaire> {
    val inventaire = inventaireService.cloturerInventaire(id)
    return ResponseEntity.ok(inventaire)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/update/{id}")
  fun mettreAJourInventaire(
    @RequestBody data: InventaireUpdateRequestDto
  ): ResponseEntity<Inventaire> {
    val inventaire = inventaireService.mettreAJourInventaire(data)
    return ResponseEntity.ok(inventaire)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/list")
  fun listerInventaires(
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Inventaire>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val inventaires = inventaireService.listerInventaires(pageable)
    return ResponseEntity.ok(inventaires)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/products")
  fun listerProduitsParInventaire(
    @PathVariable id: Long,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<ProduitInventaire>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val produits = inventaireService.listerProduitsParInventaire(id, pageable)
    return ResponseEntity.ok(produits)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable/{id}/products")
  fun listerProduitsParInventaireAsMap(
    @PathVariable id: String,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val produits = inventaireService.listerProduitsParInventaireAsMap(id, pageable)
    return ResponseEntity.ok(produits)
  }

}
