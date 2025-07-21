package com.example.backend.controllers

import com.example.backend.services.ProduitService
import com.example.backend.dtos.*
import com.example.backend.exceptions.NotFoundException
import com.example.backend.exceptions.ValidationException
import com.example.backend.models.RetourProduit
import com.example.backend.services.ProduitRetourRequestDto
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/produits")
class ProduitController(
  private val produitService: ProduitService
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createProduit(@RequestBody request: ProduitRequestDto): ResponseEntity<Any> {
    return try {
      ResponseEntity.status(HttpStatus.CREATED).body(produitService.createProduit(request))
    } catch (e: ValidationException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(mapOf("error" to "Erreur interne: ${e.localizedMessage}"))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  fun getProduitById(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.getProduitById(id))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/map")
  fun getProduitByIdMap(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.getProduitByIdMap(id))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/info")
  fun getProduitDetailById(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.getProduitDetailById(id))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/info/en_rayon")
  fun getProduitEnRayonDetailById(@PathVariable id: Int): ResponseEntity<List<Map<String,Any?>>> {
    return ResponseEntity.ok(produitService.getProduitEnRayonDetailById(id))

  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/info/scan/en_rayon")
  fun getEnRayonDetailById(@PathVariable id: String): ResponseEntity<Map<String,Any?>> {
    return ResponseEntity.ok(produitService.getEnRayonDetailById(id))
  }

//  @CrossOrigin(origins = ["http://localhost:4200"])
//  @PreAuthorize("isAuthenticated()")
//  @GetMapping("/{id}/info/scan/en_rayon/param")
//  fun searchProductsParam(
//    @PathVariable id: String,
//    @RequestParam(required = false) rayonId: String?,
//    @RequestParam(required = false) fabriquantId: String?,
//    @RequestParam(required = false) etagereId: String?,
//    @RequestParam(required = false) formeId: String?,
//    @RequestParam(required = false) magasinId: String?,
//    @RequestParam(required = false) categorieId: String?
//  ): ResponseEntity<Map<String,Any?>> {
//    val result = produitService.getEnRayonDetailByIdParam(id, rayonId!!.toInt(), fabriquantId!!.toInt(),etagereId!!.toInt(),formeId!!.toInt(),magasinId!!.toInt(),categorieId!!.toInt())
//    return ResponseEntity.ok(result)
//  }

  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllProduits(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(required = false) search: String,
    @RequestParam(defaultValue = "id") sortBy: String
  ): ResponseEntity<Page<ProduitResponseDto>> {
    val pageNumber = page.toIntOrNull() ?: 0 // Default to 0 if conversion fails
    val pageSize = size.toIntOrNull() ?: 10 // Default to 10 if conversion fails
    val produits = produitService.getAllProduits(PageRequest.of(pageNumber, pageSize, Sort.by(sortBy)))
    return ResponseEntity.ok(produits)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/products/search")
  fun searchProducts(
    @RequestParam("query") query: String,
    @RequestParam("page", defaultValue = "0") page: Int,
    @RequestParam("size", defaultValue = "10") size: Int,
  ): ResponseEntity<Page<Map<String,Any?>>> {
    val result = produitService.searchProducts(query, page, size)
    return ResponseEntity.ok(result)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/products/search/param")
  fun searchProductsParam(
    @RequestParam("query") query: String,
    @RequestParam("page", defaultValue = "0") page: Int,
    @RequestParam("size", defaultValue = "10") size: Int,
    @RequestParam(required = false) rayonId: String?,
    @RequestParam(required = false) fabriquantId: String?,
    @RequestParam(required = false) etagereId: String?,
    @RequestParam(required = false) formeId: String?,
    @RequestParam(required = false) magasinId: String?,
    @RequestParam(required = false) categorieId: String?
  ): ResponseEntity<Page<Map<String,Any?>>> {
    val result = produitService.searchProductsWithParam(query, page, size,rayonId, fabriquantId, etagereId, formeId, magasinId, categorieId)
    return ResponseEntity.ok(result)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
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

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteProduit(@PathVariable id: Int): ResponseEntity<Any> {
    return try {
      produitService.deleteProduit(id)
      ResponseEntity.noContent().build()
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/stock")
  fun updateStockProduit(
    @PathVariable id: Int,
    @RequestBody request: ProduitStockUpdateRequestDto
  ): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.updateStockProduit(id, request))
    } catch (e: ValidationException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/tarification")
  fun updateTarificationProduit(
    @PathVariable id: Int,
    @RequestBody request: ProduitTarificationUpdateRequestDto
  ): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitService.updateTarificationProduit(id, request))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  // Endpoints for Categorie, Fournisseur, Depot, Rayon
  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/categories")
  fun createCategorie(@RequestBody dto: CategorieDto) =
    ResponseEntity.status(HttpStatus.CREATED).body(produitService.createCategorie(dto))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/categories")
  fun getAllCategories() = ResponseEntity.ok(produitService.getAllCategories())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/fournisseurs")
  fun createFournisseur(@RequestBody dto: FournisseurDto) =
    ResponseEntity.status(HttpStatus.CREATED).body(produitService.createFournisseur(dto))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/fournisseurs")
  fun getAllFournisseurs() = ResponseEntity.ok(produitService.getAllFournisseurs())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/rayons")
  fun createRayon(@RequestBody dto: RayonDto) =
    ResponseEntity.status(HttpStatus.CREATED).body(produitService.createRayon(dto))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/rayons")
  fun getAllRayons() = ResponseEntity.ok(produitService.getAllRayons())


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/details")
  fun getProduitDetails(@PathVariable id: Int): ResponseEntity<Map<String, Any?>> {
    return ResponseEntity.ok(produitService.getProduitDetails(id))
  }

}
