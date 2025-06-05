package com.example.backend.controllers

import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.services.CaisseException
import com.example.backend.services.CaisseService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/caisses")
class CaisseController(
  private val caisseService: CaisseService
) {

  @PostMapping("/ouvrir")
  fun ouvrirCaisse(@RequestBody ouvertureRequestDto: CaisseOuvertureRequestDto): ResponseEntity<Any> {
    return try {
      val caisseDto = caisseService.ouvrirCaisse(ouvertureRequestDto)
      ResponseEntity.ok(caisseDto)
    } catch (e: CaisseException) {
      ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
    } catch (e: Exception) {
      ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Une erreur interne est survenue: ${e.message}"))
    }
  }

  // TODO: Endpoints pour fermer la caisse, lister les opérations, etc.
}
