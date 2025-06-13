package com.example.backend.controllers

import com.example.backend.dtos.CommandeRequest
import com.example.backend.models.Commande
import com.example.backend.models.Fabriquant
import com.example.backend.services.CommandeService
import com.example.backend.services.FabriquantService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/commandes")
class CommandeController(
  private val commandeService: CommandeService) {


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun creerCommande(@RequestBody commandeDto: CommandeRequest): ResponseEntity<Commande> {
    val commande = commandeService.createCommande(commandeDto)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllCommandesMapped(): ResponseEntity<List<Map<String, Any?>>> {
      val commandes = commandeService.getAllCommandesMapped()
      return ResponseEntity.ok(commandes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  fun obtenirCommande(@PathVariable id: Long): ResponseEntity<Map<String, Any?>> {
    val commande = commandeService.getCommandeById(id)
    return ResponseEntity.ok(commande)
  }

//  @PutMapping("/{id}")
//  fun validerCommande(@PathVariable id: Long): ResponseEntity<Commande> {
//    val commande = commandeService.validerCommande(id)
//    return ResponseEntity.ok(commande)
//  }
}
