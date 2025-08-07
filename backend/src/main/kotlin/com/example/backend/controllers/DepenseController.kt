package com.example.backend.controllers

import com.example.backend.models.Depense
import com.example.backend.services.DepenseService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/depenses")
class DepenseController(private val depenseService: DepenseService) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
    @GetMapping
    fun getAllDepenses(): ResponseEntity<List<Depense>> {
        return ResponseEntity.ok(depenseService.getAllDepenses())
    }
  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
    @GetMapping("/pageable")
    fun getAllDepensesPageable(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
    ): ResponseEntity<Page<Map<String, Any?>>> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "dateDepense"))
    return ResponseEntity.ok(depenseService.getAllDepensesPageabel(pageable))
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
