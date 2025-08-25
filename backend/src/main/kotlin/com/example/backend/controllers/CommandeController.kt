package com.example.backend.controllers

import com.example.backend.dtos.*
import com.example.backend.models.Commande
import com.example.backend.services.CommandeService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.io.File

@RestController
@RequestMapping("/api/commandes")
class CommandeController(
  private val commandeService: CommandeService
) {


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  fun creerCommande(@RequestBody commandeDto: CommandeRequest): ResponseEntity<Commande> {
    val commande = commandeService.createCommande(commandeDto)
    return ResponseEntity.ok(commande)
  }


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/reception")
  fun receptionnerCommande(
    @PathVariable id: Long,
    @RequestParam receptionType: String,
    @RequestBody productCmdList: List<ProduitCmdRequest>
  ): ResponseEntity<Commande> {
    val commande = commandeService.receptionnerCommande(id, receptionType, productCmdList)
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
  @GetMapping("/paged")
  fun getAllCommandesMapped(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
    @RequestParam(required = false) search: String?,
    @RequestParam(required = false) etat: String?,
    @RequestParam(required = false) typeFournisseur: String?,
    @RequestParam(required = false) fournisseurId: String?,
    @RequestParam(required = false) startDate: String?,
    @RequestParam(required = false) endDate: String?
  ): ResponseEntity<CommandePageableCustomlDto> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "dateCreation"))
    val commandes =
      commandeService.getAllCommandesMappedPageable(pageable, etat, fournisseurId, typeFournisseur, startDate, endDate)
    return ResponseEntity.ok(commandes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  fun obtenirCommande(@PathVariable id: Long): ResponseEntity<Map<String, Any?>> {
    val commande = commandeService.getCommandeById(id)
    return ResponseEntity.ok(commande)
  }


  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/modifier-lignes")
  fun modifierLignes(@PathVariable id: Long, @RequestBody produits: List<ProduitCmdRequest>): ResponseEntity<Commande> {
    val commande = commandeService.modifierLignesCommande(id, produits)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/commande_par_fournisseur")
  fun commandeByFournisseur(
    @RequestParam fournisseurId: String?,
    @RequestParam totalAmount: String,
    @RequestBody produits: List<CommandeNewDTO>
  ): ResponseEntity<Commande> {
    val commande = commandeService.commandeByFournisseur(fournisseurId, totalAmount, produits)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun supprimerCommande(@PathVariable id: Long): ResponseEntity<Void> {
    commandeService.supprimerCommande(id)
    return ResponseEntity.noContent().build()
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/ajouter-fournisseur")
  fun ajouterFournisseur(@PathVariable id: Long, @RequestParam fournisseurId: Long): ResponseEntity<Commande> {
    val commande = commandeService.ajouterFournisseur(id, fournisseurId)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/annuler")
  fun annulerCommande(@PathVariable id: Long): ResponseEntity<Commande> {
    val commande = commandeService.annulerCommande(id)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/imprimer-bon-pdf")
  fun imprimerBonPdf(@PathVariable id: Long): ResponseEntity<ByteArray> {
    val outputPath = "temp_bon_commande.pdf" // Temporary file path
    commandeService.imprimerBonPdf(id, outputPath)

    val file = File(outputPath)
    val fileContent = file.readBytes()
    file.delete() // Clean up the temporary file

    return ResponseEntity.ok()
      .header("Content-Disposition", "attachment; filename=bon_commande.pdf")
      .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
      .body(fileContent)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/reception-complementaire")
  fun receptionComplementaire(
    @PathVariable id: Long,
    @RequestBody produits: List<ProduitCmdRequest>
  ): ResponseEntity<Commande> {
    val commande = commandeService.receptionComplementaire(id, produits)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/ajouter-justificatif")
  fun ajouterJustificatif(@PathVariable id: Long, @RequestParam justificatif: String): ResponseEntity<Commande> {
    val commande = commandeService.ajouterJustificatif(id, justificatif)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/historique-reception")
  fun visualiserHistorique(@PathVariable id: Long): ResponseEntity<List<Map<String, Any?>>> {
    val historique = commandeService.visualiserHistoriqueReception(id)
    return ResponseEntity.ok(historique)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/cloturer")
  fun cloturerCommande(@PathVariable id: Long): ResponseEntity<Map<String, Any?>> {
    val commande = commandeService.cloturerCommande(id)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/ajouter-facture")
  fun ajouterFacture(@PathVariable id: Long, @RequestParam facture: String): ResponseEntity<Commande> {
    val commande = commandeService.ajouterFacture(id, facture)
    return ResponseEntity.ok(commande)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/generer-rapport")
  fun genererRapport(@PathVariable id: Long): ResponseEntity<String> {
    var data = commandeService.genererRapportLivraison(id)
    return ResponseEntity.ok(data)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}/exporter")
  fun exporterCommande(@PathVariable id: Long): ResponseEntity<String> {
    var data = commandeService.exporterCommande(id)
    return ResponseEntity.ok(data)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/{id}/ajouter-motif-annulation")
  fun ajouterMotifAnnulation(@PathVariable id: Long, @RequestParam motif: String): ResponseEntity<Void> {
    commandeService.annulerCommande(id)
    commandeService.ajouterMotifAnnulation(id, motif)
    return ResponseEntity.noContent().build()
  }

//  @PutMapping("/{id}")
//  fun validerCommande(@PathVariable id: Long): ResponseEntity<Commande> {
//    val commande = commandeService.validerCommande(id)
//    return ResponseEntity.ok(commande)
//  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/product/paged")
  fun getCommandeInfoByProduct(
    @RequestParam(defaultValue = "0") page: String,
    @RequestParam(defaultValue = "10") size: String,
    @RequestParam(defaultValue = "id") sortBy: String,
    @RequestParam(required = false) produitId: String?,
    @RequestParam(required = false) startDate: String?,
    @RequestParam(required = false) endDate: String?
  ): ResponseEntity<CommandePageableCustomlDto> {
    val pageNumber = page.toIntOrNull()?.coerceAtLeast(0) ?: 0
    val pageSize = size.toIntOrNull()?.coerceAtLeast(1) ?: 10
    val pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "commande.dateCreation"))
    val commandes = commandeService.getCommandeInfoByProduct(pageable, produitId, startDate, endDate)
    return ResponseEntity.ok(commandes)
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PostMapping("/product-commande/update")
  fun updateCommandeSimple(
    @RequestParam(required = false) commandeId: String?,
    @RequestParam(required = false) produitCmdId: String?,
    @RequestParam(required = false) qteRecu: String?,
    @RequestParam(required = false) prixAchat: String?,
    @RequestParam(required = false) prixVente: String?,
  ): ResponseEntity<Commande> {
    val commandes = commandeService.updateCommandeSimple(
      commandeId,
      produitCmdId,
      qteRecu,
      prixAchat,
      prixVente
    )
    return ResponseEntity.ok(commandes)
  }
}
