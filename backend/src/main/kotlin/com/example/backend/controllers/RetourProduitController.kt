package com.example.backend.controllers

import com.example.backend.dtos.EncaissementDto
import com.example.backend.dtos.EncaissementRequestDto
import com.example.backend.dtos.VenteRequestDto
import com.example.backend.models.Facturation
import com.example.backend.models.RetourProduit
import com.example.backend.models.Vente
import com.example.backend.services.ProduitRetourRequestDto
import com.example.backend.services.ProduitService
import com.example.backend.services.RetourProduitService
import com.example.backend.services.VenteService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/retour-produits")
class RetourProduitController(
  private val retourProduitService: RetourProduitService,
  private val venteService: VenteService,
  private val produitService: ProduitService
) {



  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/retour/{venteId}")
  fun retournerProduitsVendusEtEnRayon(
    @PathVariable venteId: Long,
    @RequestBody produitsRetour: List<ProduitRetourRequestDto>
  ): ResponseEntity<RetourProduit> {
    return try {
      val retourProduit = produitService.retournerProduitsVendusEtEnRayon(venteId, produitsRetour)
      ResponseEntity.ok(retourProduit)
    } catch (e: IllegalArgumentException) {
      ResponseEntity.badRequest().body(null)
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null)
    }
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/liste")
  fun listerRetourProduitsAvecDetails(pageable: Pageable): ResponseEntity<Page<Map<String, Any?>>> {
    val retourProduitsPage = retourProduitService.listerRetourProduitsAvecDetails(pageable)
    return ResponseEntity.ok(retourProduitsPage)
  }

}
