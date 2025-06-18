package com.example.backend.controllers

import com.example.backend.models.Forme
import com.example.backend.models.Prescripteur
import com.example.backend.services.FormeService
import com.example.backend.services.PrescripteurService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/prescripteurs")
class PrescripteurController(private val prescripteurService: PrescripteurService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createForme(@RequestBody prescripteur: Prescripteur): ResponseEntity<Prescripteur> =
    ResponseEntity.status(HttpStatus.CREATED).body(prescripteurService.createPrescripteur(prescripteur))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllPrescripteurs(): ResponseEntity<List<Prescripteur>> =
    ResponseEntity.ok(prescripteurService.getAllPrescripteurs())

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updatePrescripteur(@PathVariable id: Int, @RequestBody prescripteur: Prescripteur): ResponseEntity<Prescripteur> =
    ResponseEntity.ok(prescripteurService.updatePrescripteur(id, prescripteur))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deletePrescripteur(@PathVariable id: Int): ResponseEntity<Void> {
    prescripteurService.deletePrescripteur(id)
    return ResponseEntity.noContent().build()
  }
}
