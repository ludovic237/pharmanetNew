package com.example.backend.controllers

import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.services.CaisseException
import com.example.backend.services.CaisseService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/produits")
class ProduitController(private val produitService: ProduitService) {

  @PostMapping
  fun createProduit(@RequestBody request: ProduitRequestDto): ResponseEntity<Any> {
    return try {
      ResponseEntity.status(HttpStatus.CREATED).body(produitService.createProduit(request))
    } catch (e: ValidationException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Erreur interne: ${e.localizedMessage}"))
    }
  }

  @GetMapping("/{id}")
  fun getProduitById(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.getProduitById(id))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @GetMapping
  fun getAllProduits(): ResponseEntity<List<ProduitResponseDto>> {
    return ResponseEntity.ok(produitService.getAllProduits())
  }

  @PutMapping("/{id}")
  fun updateProduit(@PathVariable id: Int, @RequestBody request: ProduitRequestDto): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.updateProduit(id, request))
    } catch (e: ValidationException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @DeleteMapping("/{id}")
  fun deleteProduit(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      produitService.deleteProduit(id)
      ResponseEntity.noContent().build()
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @PostMapping("/{id}/stock")
  fun updateStockProduit(@PathVariable id: Int, @RequestBody request: ProduitStockUpdateRequestDto): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.updateStockProduit(id, request))
    } catch (e: ValidationException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @PostMapping("/{id}/tarification")
  fun updateTarificationProduit(@PathVariable id: Int, @RequestBody request: ProduitTarificationUpdateRequestDto): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.updateTarificationProduit(id, request))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  // Endpoints for Categorie, Fournisseur, Depot, Rayon
  @PostMapping("/categories")
  fun createCategorie(@RequestBody dto: CategorieDto) = ResponseEntity.status(HttpStatus.CREATED).body(produitService.createCategorie(dto))
  @GetMapping("/categories")
  fun getAllCategories() = ResponseEntity.ok(produitService.getAllCategories())

  @PostMapping("/fournisseurs")
  fun createFournisseur(@RequestBody dto: FournisseurDto) = ResponseEntity.status(HttpStatus.CREATED).body(produitService.createFournisseur(dto))
  @GetMapping("/fournisseurs")
  fun getAllFournisseurs() = ResponseEntity.ok(produitService.getAllFournisseurs())

  @PostMapping("/depots")
  fun createDepot(@RequestBody dto: DepotDto) = ResponseEntity.status(HttpStatus.CREATED).body(produitService.createDepot(dto))
  @GetMapping("/depots")
  fun getAllDepots() = ResponseEntity.ok(produitService.getAllDepots())

  @PostMapping("/rayons")
  fun createRayon(@RequestBody dto: RayonDto) = ResponseEntity.status(HttpStatus.CREATED).body(produitService.createRayon(dto))
  @GetMapping("/rayons")
  fun getAllRayons() = ResponseEntity.ok(produitService.getAllRayons())
}
