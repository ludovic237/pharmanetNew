package com.example.backend.controllers

import com.example.backend.dtos.EncaissementDto
import com.example.backend.dtos.EncaissementRequestDto
import com.example.backend.dtos.VenteRequestDto
import com.example.backend.models.Facturation
import com.example.backend.models.RetourProduit
import com.example.backend.models.Vente
import com.example.backend.services.ProduitRetourRequestDto
import com.example.backend.services.ProduitService
import com.example.backend.services.VenteService
import org.bouncycastle.util.test.FixedSecureRandom.BigInteger
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/ventes")
class VenteController(
  private val venteService: VenteService,
  private val produitService: ProduitService
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/creer-sans-encaissement")
  fun creerVenteSansEncaissement(@RequestBody venteRequestDto: VenteRequestDto): ResponseEntity<Vente> {
    val nouvelleVente = venteService.creerVenteSansEncaissement(venteRequestDto)
    return ResponseEntity.ok(nouvelleVente)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{venteId}/encaisser")
  fun encaisserVente(
    @PathVariable venteId: Long,
    @RequestBody encaissementRequestDto: EncaissementDto
  ): ResponseEntity<Facturation> {
    val facturation = venteService.encaisserVente(encaissementRequestDto)
    return ResponseEntity.ok(facturation)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{venteId}/non-encaissee")
  fun chargerVentesEnCoursNonEncaisser(@PathVariable venteId: Long): ResponseEntity<Map<String, Any?>> {
    val ventesEnCours = venteService.chargerVentesEnCoursNonEncaisser(venteId)
    return ResponseEntity.ok(ventesEnCours)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{venteId}/supprimer")
  fun supprimerVente(@PathVariable venteId: Long): ResponseEntity<Map<String, Any?>> {
    val ventesEnCours = venteService.supprimerVente(venteId)
    return ResponseEntity.ok(ventesEnCours)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/vente-non-encaissees")
  fun listerVentesNonEncaissees(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "dateVente"))
    val ventes = venteService.listerVentesNonEncaissees(pageable)
    return ResponseEntity.ok(ventes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/lister")
  fun listerVentes(): ResponseEntity<List<Map<String, Any?>>> {
    val ventes = venteService.listerVentes()
    return ResponseEntity.ok(ventes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable/lister")
  fun listerPageableVentes(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
    @RequestParam(required = false) etat: String?,
    @RequestParam(required = false) dateVente: String?,
    @RequestParam(required = false) dateEncaissement: String?,
    @RequestParam(required = false) userId: String?,
    @RequestParam(required = false) employeId: String?,
    @RequestParam(required = false) prescripteurId: String?,
    @RequestParam(required = false) caisseId: String?
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "dateVente"))
    val commandes = venteService.listerVentesPageable(pageable,etat
      ,dateVente
      ,dateEncaissement
      ,userId
      ,employeId
      ,prescripteurId
      ,caisseId)
    return ResponseEntity.ok(commandes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/vente-encaissee")
  fun listerVentesEncaissees(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "dateVente"))
    val ventes = venteService.listerVentesEncaissees(pageable)
    return ResponseEntity.ok(ventes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{venteId}/encaissee")
  fun chargerVentesEncaisser(@PathVariable venteId: Long): ResponseEntity<Map<String, Any?>> {
    val ventesEnCours = venteService.chargerVentesEncaisser(venteId)
    return ResponseEntity.ok(ventesEnCours)
  }

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
  @GetMapping("/details/{reference}")
  fun getVenteDetailsByReference(@PathVariable reference: String): ResponseEntity<Map<String, Any?>> {
    return try {
      val venteDetails = venteService.getVenteDetailsByReference(reference)
      ResponseEntity.ok(venteDetails)
    } catch (e: IllegalArgumentException) {
      ResponseEntity.badRequest().body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(500).body(mapOf("error" to "Internal server error"))
    }
  }

}
