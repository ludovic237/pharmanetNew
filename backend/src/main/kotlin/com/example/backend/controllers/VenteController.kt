package com.example.backend.controllers

import com.example.backend.dtos.EncaissementRequestDto
import com.example.backend.dtos.VenteRequestDto
import com.example.backend.models.Facturation
import com.example.backend.models.Vente
import com.example.backend.services.VenteService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/ventes")
class VenteController(
  private val venteService: VenteService
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
    @RequestBody encaissementRequestDto: EncaissementRequestDto
  ): ResponseEntity<Facturation> {
    val facturation = venteService.encaisserVente(venteId, encaissementRequestDto)
    return ResponseEntity.ok(facturation)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{venteId}/non-encaissee")
  fun chargerVentesEnCoursNonEncaisser(@PathVariable venteId: Long): ResponseEntity<Map<String, Any?>> {
    val ventesEnCours = venteService.chargerVentesEnCoursNonEncaisser(venteId)
    return ResponseEntity.ok(ventesEnCours)
  }
}
