package com.example.backend.controllers

import com.example.backend.dtos.InventaireNewCreatetDto
import com.example.backend.dtos.InventaireOneProductUpdateRequestDto
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
  @PostMapping("/create-new")
  fun creerInventaireNew(
    @RequestBody data: InventaireNewCreatetDto
  ): ResponseEntity<Inventaire> {
    val inventaire = inventaireService.creerInventaireNew(data)
    return ResponseEntity.ok(inventaire)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/close/{id}")
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
  @PutMapping("/update/valid/product/{id}")
  fun addProductToInventory(
    @RequestBody data: InventaireOneProductUpdateRequestDto
  ): ResponseEntity<ProduitInventaire> {
    val inventaire = inventaireService.valideProductToInventory(data)
    return ResponseEntity.ok(inventaire)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/update/invalid/product/{id}")
  fun invalideProductToInventory(
    @PathVariable id: String
  ): ResponseEntity<Map<String, Any?>> {
    val inventaire = inventaireService.invalideProductToInventory(id)
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
  @GetMapping("/list/new")
  fun listerInventairesCustom(
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val inventaires = inventaireService.listerInventairesCustom(pageable)
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
    @RequestParam(required = false) search: String?,
    @RequestParam(defaultValue = "desc") direction: String
//    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {

    var newSort = if (direction.equals("asc", ignoreCase = true)) {
      Sort.by(Sort.Direction.ASC, sort)
    } else {
      Sort.by(Sort.Direction.DESC, sort)
    }
    val pageable = PageRequest.of(page, size, newSort)
    val produits = inventaireService.listerProduitsParInventaireAsMap(search,id, pageable)
    return ResponseEntity.ok(produits)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable/{id}/filter/products")
  fun listerProduitsParInventaireAvecFiltre(
    @PathVariable id: String,
    @RequestParam(defaultValue = "equal") filtre: String,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "desc") direction: String
//    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
//    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateDebut"))
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val produits = inventaireService.listerProduitsParInventaireAvecFiltre(id, pageable,filtre)
    return ResponseEntity.ok(produits)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/info/produit_inventaire/{id}")
  fun getInfoProduitsInventaire(
    @PathVariable id: String
  ): ResponseEntity<Map<String, Any?>> {
    val produits = inventaireService.getInfoProduitsInventaire(id)
    return ResponseEntity.ok(produits)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/terminer/{id}")
  fun terminerInventaire(@PathVariable id: Long,
                         @RequestParam commentaire: String): ResponseEntity<Inventaire> {
    val inventaire = inventaireService.terminerInventaire(id,commentaire)
    return ResponseEntity.ok(inventaire)
  }

}
