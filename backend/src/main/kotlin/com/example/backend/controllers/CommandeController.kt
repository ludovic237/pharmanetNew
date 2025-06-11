package com.example.backend.controllers

import com.example.backend.models.Fabriquant
import com.example.backend.services.FabriquantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/fabriquants")
class CommandeController(private val com: FabriquantService) {


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun creerCommande(@RequestBody commandeDto: CommandeDto): ResponseEntity<Commande> {
    val commande = commandeService.creerCommande(commandeDto)
    return ResponseEntity.status(HttpStatus.CREATED).body(commande)
  }

  @GetMapping("/{id}")
  fun obtenirCommande(@PathVariable id: Long): ResponseEntity<Commande> {
    val commande = commandeService.obtenirCommande(id)
    return ResponseEntity.ok(commande)
  }

  @PutMapping("/{id}")
  fun validerCommande(@PathVariable id: Long): ResponseEntity<Commande> {
    val commande = commandeService.validerCommande(id)
    return ResponseEntity.ok(commande)
  }
}
