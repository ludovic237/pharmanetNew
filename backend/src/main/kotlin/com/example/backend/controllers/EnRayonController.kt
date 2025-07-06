package com.example.backend.controllers

import com.example.backend.dtos.EnRayonDto
import com.example.backend.dtos.ProduitEnRayonDto
import com.example.backend.dtos.RayonDto
import com.example.backend.models.EnRayon
import com.example.backend.services.EnRayonService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime


@RestController
@RequestMapping("/api/en-rayon")
class EnRayonController(private val enRayonService: EnRayonService) {

    @CrossOrigin(origins = ["http://localhost:4200"])
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/ajouter")
    fun ajouterProduitsEnRayon(@RequestBody produits: List<ProduitEnRayonDto>): ResponseEntity<List<EnRayon>> {
        val enRayonList = enRayonService.ajouterProduitsEnRayon(produits)
        return ResponseEntity.ok(enRayonList)
    }

    @CrossOrigin(origins = ["http://localhost:4200"])
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/mettre-a-jour")
    fun mettreAJourProduitsEnRayon(@RequestBody produits: List<ProduitEnRayonDto>): ResponseEntity<List<EnRayon>> {
        val enRayonList = enRayonService.mettreAJourProduitsEnRayon(produits)
        return ResponseEntity.ok(enRayonList)
    }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-nom-produit")
  fun getProduitsEnRayonParNomProduit(@RequestParam nomProduit: String): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParNomProduit(nomProduit))


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-produit")
  fun getProduitsEnRayonParProduitIdt(@RequestParam produitId: Int): ResponseEntity<List<Map<String, Any?>>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParProduitIdt(produitId))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-nom-rayon")
  fun getProduitsEnRayonParNomRayon(@RequestParam nomRayon: String): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParNomRayon(nomRayon))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-fournisseur")
  fun getProduitsEnRayonParFournisseur(@RequestParam nomFournisseur: String): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParFournisseur(nomFournisseur))

/*  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-uniter")
  fun getProduitsEnRayonParUniter(@RequestParam uniter: String): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParUniter(uniter))*/

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-commande")
  fun getProduitsEnRayonParCommande(@RequestParam commandeId: Long): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParCommande(commandeId))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-date-livraison")
  fun getProduitsEnRayonParIntervalleDateLivraison(
    @RequestParam startDate: LocalDateTime,
    @RequestParam endDate: LocalDateTime
  ): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParIntervalleDateLivraison(startDate, endDate))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-date-peremption")
  fun getProduitsEnRayonParIntervalleDatePeremption(
    @RequestParam startDate: LocalDateTime,
    @RequestParam endDate: LocalDateTime
  ): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParIntervalleDatePeremption(startDate, endDate))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-prix-achat")
  fun getProduitsEnRayonParIntervallePrixAchat(
    @RequestParam minPrix: Double,
    @RequestParam maxPrix: Double
  ): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParIntervallePrixAchat(minPrix, maxPrix))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/par-prix-vente")
  fun getProduitsEnRayonParIntervallePrixVente(
    @RequestParam minPrix: Double,
    @RequestParam maxPrix: Double
  ): ResponseEntity<List<EnRayon>> =
    ResponseEntity.ok(enRayonService.getProduitsEnRayonParIntervallePrixVente(minPrix, maxPrix))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/save")
  fun mettreAJourProduitEnRayon(@RequestBody rayonDto: EnRayonDto?): ResponseEntity<EnRayon> {
    val enRayon = enRayonService.mettreAJourProduitEnRayon(rayonDto!!)
    return ResponseEntity.ok(enRayon)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/pageable")
  fun getProduitsEnRayonPageable(
    @RequestParam(required = false) nomProduit: String?,
    @RequestParam(required = false) bientotPerimee: String?,
    @RequestParam(required = false) joursAvantPeremption: String?,
    @RequestParam(required = false) enStock: String?,
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int,
    @RequestParam(defaultValue = "id") sort: String,
    @RequestParam(defaultValue = "asc") direction: String
  ): ResponseEntity<Page<Map<String, Any?>>> {
    val bientotPerimeeBoolean: Boolean? = when (bientotPerimee?.lowercase()) {
      "true" -> true
      "false" -> false
      else -> null
    }
    val enStockBoolean: Boolean? = when (enStock?.lowercase()) {
      "true" -> true
      "false" -> false
      else -> null
    }
    val joursAvantPeremptionInt: Int = joursAvantPeremption?.toIntOrNull() ?: 0
    val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))
    val result = enRayonService.getProduitsEnRayonPageable(nomProduit, bientotPerimeeBoolean, joursAvantPeremptionInt, enStockBoolean, pageable)
    return ResponseEntity.ok(result)
  }

}
