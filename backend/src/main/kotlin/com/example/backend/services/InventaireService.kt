package com.example.backend.services

import com.example.backend.dtos.InventaireRequestDto
import com.example.backend.models.Inventaire
import com.example.backend.models.ProduitInventaire
import com.example.backend.repositories.EmployeRepository
import com.example.backend.repositories.EnRayonRepository
import com.example.backend.repositories.InventaireRepository
import com.example.backend.repositories.ProduitInventaireRepository
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class InventaireService(
  private val userUtils: UserUtils,
  private val enRayonRepository: EnRayonRepository,
  private val employeRepository: EmployeRepository,
  private val inventaireRepository: InventaireRepository,
  private val produitInventorieRepository: ProduitInventaireRepository
) {

  @Transactional
  fun creerInventaire(data: InventaireRequestDto): Inventaire {
    var currentUser = userUtils.getCurrentUser()
    var employe =employeRepository.findByUser(currentUser!!)
    val inventaire = Inventaire().apply {
      this.dateDebut = LocalDateTime.now()
      etat = "en cours"
    }
    val savedInventaire = inventaireRepository.save(inventaire)

    data.produitList.forEach { produit ->
      var rayon = enRayonRepository.findById(produit.rayonId.toInt())
        .orElseThrow { IllegalArgumentException("Rayon introuvable avec l'ID: ${produit.rayonId}") }
      var produitInventaire = ProduitInventaire().apply {}
      produitInventaire.enRayon = rayon
      produitInventaire.employe = employe
      produitInventaire.stockValide = produit.quantiteReel
      produitInventaire.stockAvant = produit.quantiteSysteme
      produitInventorieRepository.save(produitInventaire)
    }

    return savedInventaire
  }

  @Transactional
  fun cloturerInventaire(inventaireId: Long): Inventaire {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    inventaire.etat = "cloturé"
    inventaire.dateFin = LocalDateTime.now()

    return inventaireRepository.save(inventaire)
  }

  @Transactional
  fun mettreAJourInventaire(inventaireId: Long, nom: String?, etat: String?): Inventaire {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

//        nom?.let { inventaire.nom = it }
    etat?.let { inventaire.etat = it }

    return inventaireRepository.save(inventaire)
  }

  fun listerInventaires(pageable: Pageable): Page<Inventaire> {
    return inventaireRepository.findAll(pageable)
  }

  @Transactional
  fun listerProduitsParInventaire(inventaireId: Long, pageable: Pageable): Page<ProduitInventaire> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    return produitInventorieRepository.findByInventaire(inventaire, pageable)
  }

  @Transactional
  fun listerProduitsParInventaireAsMap(inventaireId: Long, pageable: Pageable): Page<Map<String, Any?>> {
    val inventaire = inventaireRepository.findById(inventaireId.toInt())
      .orElseThrow { IllegalArgumentException("Inventaire introuvable avec l'ID: $inventaireId") }

    val produitsPage = produitInventorieRepository.findByInventaire(inventaire, pageable)

    return produitsPage.map { produit ->
      mapOf(
        "id" to produit.id,
        "nom" to produit.enRayon?.produit?.nom,
        "quantiteSysteme" to produit.stockAvant,
        "quantiteReelle" to produit.stockValide,
        "comparaison" to (produit?.stockAvant?.minus(produit?.stockValide!!))
      )
    }
  }

}
