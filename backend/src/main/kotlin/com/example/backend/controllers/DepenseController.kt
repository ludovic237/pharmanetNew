package com.example.backend.controllers

import com.example.backend.models.Depense
import com.example.backend.services.DepenseService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/depenses")
class DepenseController(private val depenseService: DepenseService) {

    @GetMapping
    fun getAllDepenses(): ResponseEntity<List<Depense>> {
        return ResponseEntity.ok(depenseService.getAllDepenses())
    }

@PostMapping
fun createDepense(@RequestBody depenseData: Map<String, Any>): ResponseEntity<Depense> {
    val designation = depenseData["designation"] as? String
        ?: throw IllegalArgumentException("Missing or invalid 'designation'")
    val prixUnitaire = depenseData["prixUnitaire"] as? Int
        ?: throw IllegalArgumentException("Missing or invalid 'prixUnitaire'")
  if (depenseData.size>3){
    val depense = depenseService.createDepenseMap(depenseData)
    return ResponseEntity.ok(depense)
  }
  else {
    val depense = depenseService.createDepense(designation, prixUnitaire)
    return ResponseEntity.ok(depense)
  }

}
    @PutMapping("/{id}")
    fun updateDepense(@PathVariable id: Int,@RequestBody depenseData: Map<String, Any>): ResponseEntity<Depense> {
    val designation = depenseData["designation"] as? String
      ?: throw IllegalArgumentException("Missing or invalid 'designation'")
    val prixUnitaire = depenseData["prixUnitaire"] as? Int
      ?: throw IllegalArgumentException("Missing or invalid 'prixUnitaire'")
    val depense = depenseService.updateDepense(id,designation, prixUnitaire)
    return ResponseEntity.ok(depense)
    }

    @DeleteMapping("/{id}")
    fun deleteDepense(@PathVariable id: Int): ResponseEntity<Void> {
        depenseService.deleteDepense(id)
        return ResponseEntity.noContent().build()
    }
}
