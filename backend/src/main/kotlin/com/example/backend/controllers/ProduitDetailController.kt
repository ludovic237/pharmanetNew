package com.example.backend.controllers

import com.example.backend.dtos.ProduitDetailDto
import com.example.backend.exceptions.NotFoundException
import com.example.backend.models.Produit
import com.example.backend.models.ProduitDetail
import com.example.backend.services.ProduitDetailService
import com.example.backend.services.ProduitService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/produits-detail")
class ProduitDetailController(
  private val produitService: ProduitService,
  private val produitDetailService: ProduitDetailService,
) {


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/info/{produitId}")
  fun getProduitDetailsInfo(@PathVariable produitId: String): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitDetailService.getProduitDetailsInfo(produitId))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/search")
  fun searchProduitDetailsByName(@RequestParam nom: String): ResponseEntity<Any> {
    return try {
      ResponseEntity.ok(produitDetailService.getProduitDetailsByName(nom))
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/search/pageable")
  fun searchProduitDetailsByName(
    @RequestParam(required = false) nom: String?,
    @RequestParam(defaultValue = "0") page: String, // Paramètre pour le numéro de page
    @RequestParam(defaultValue = "10") size: String,  // Paramètre pour la taille de la page
    @RequestParam(defaultValue = "id") sortBy: String
  ): ResponseEntity<Any> {
    return try {
      val pageNumber = page.toIntOrNull() ?: 0 // Default to 0 if conversion fails
      val pageSize = size.toIntOrNull() ?: 10 // Default to 10 if conversion fails
      // Crée un objet Pageable à partir des paramètres de la requête
      val pageable: Pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy))
      // Appelle la nouvelle méthode de service paginée
      val resultPage = produitDetailService.getProduitDetailsByNamePageable(nom, pageable)
      ResponseEntity.ok(resultPage)
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/list/pageable")
  fun getProduitDetailsList(
    @RequestParam(required = false) query: String?,
    @RequestParam(defaultValue = "0") page: String, // Paramètre pour le numéro de page
    @RequestParam(defaultValue = "10") size: String,  // Paramètre pour la taille de la page
    @RequestParam(defaultValue = "id") sortBy: String
  ): ResponseEntity<Any> {
    return try {
      val pageNumber = page.toIntOrNull() ?: 0 // Default to 0 if conversion fails
      val pageSize = size.toIntOrNull() ?: 10 // Default to 10 if conversion fails
      // Crée un objet Pageable à partir des paramètres de la requête
      val pageable: Pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy))
      // Appelle la nouvelle méthode de service paginée
      val resultPage = produitDetailService.getProduitDetailsPageable(pageable)
      ResponseEntity.ok(resultPage)
    } catch (e: NotFoundException) {
      ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/add")
  fun createProduit(@RequestBody produit: ProduitDetailDto?): ResponseEntity<ProduitDetail> {
    return ResponseEntity.ok(produitDetailService.createProduitDetail(produit))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/update/{produitDetailId}")
  fun updateProduitDetail(@PathVariable produitDetailId: String,@RequestBody produit: ProduitDetailDto?): ResponseEntity<ProduitDetail> {
    return ResponseEntity.ok(produitDetailService.updateProduitDetail(produitDetailId,produit))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/remove/prarent")
  fun removeParentDetail(@RequestParam productId: String, @RequestParam productDetailId:String): ResponseEntity<Produit> {
    return ResponseEntity.ok(produitDetailService.removeParentDetail(productId,productDetailId))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/remove")
  fun removeProduitDetail(@RequestParam productDetailId:String): ResponseEntity<ProduitDetail> {
    return ResponseEntity.ok(produitDetailService.removeProduitDetail(productDetailId))
  }

}
