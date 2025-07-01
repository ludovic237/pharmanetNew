package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.models.Caisse
import com.example.backend.repositories.CaisseRepository
import com.example.backend.repositories.EmployeRepository
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class CaisseService(
  private val caisseRepository: CaisseRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils
) {

  fun isCaisseOuverte(): Boolean {
    return caisseRepository.existsByEtatAndSupprimer(Caisse.ETAT_OUVERT, 0)
  }

  fun getActiveCaisse(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer(Caisse.ETAT_OUVERT, 0)
      .firstOrNull()
  }


  fun getCaisseAttenteCloture(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer(Caisse.ETAT_CLOTURE_EN_ATTENTE, 0)
      .firstOrNull()
  }

  @Transactional
  fun ouvrirCaisse(requestDto: CaisseOuvertureRequestDto): CaisseDto {
    val currentUser = userUtils.getCurrentUser()
      ?: throw CaisseException("Unable to retrieve the logged-in user.")

    val employeData = employeRepository.findByUser(currentUser)

    // Check if there is already an active caisse
    val activeCaisse = caisseRepository.findByEtatAndSupprimer(Caisse.ETAT_OUVERT, 0).firstOrNull()
    if (activeCaisse != null) {
      throw CaisseException("A caisse (ID: ${activeCaisse.id}, Session: ${activeCaisse.session}) is already open.")
    }

    // Create a new caisse
    val nouvelleCaisse = Caisse().apply {
      employe = employeData
      fondCaisseOuvert = requestDto.fondCaisseOuvert.toDouble()
      ouvertureCaisse = requestDto.ouvertureCaisse
      dateOuvert = LocalDateTime.now()
      session = genererSessionId()
      etat = Caisse.ETAT_OUVERT
      supprimer = 0
    }

    val savedCaisse = caisseRepository.save(nouvelleCaisse)
    return mapToCaisseDto(savedCaisse)
  }

  private fun genererSessionId(): String {
    // Ge un identifiant de session simple, vous pouvez le rendre plus complexe
    return "SESS-${LocalDateTime.now().year}${LocalDateTime.now().monthValue}${LocalDateTime.now().dayOfMonth}-${
      UUID.randomUUID().toString().substring(0, 8).uppercase()
    }"
  }

  fun mapToCaisseDto(caisse: Caisse): CaisseDto {
    return CaisseDto(
      id = caisse.id,
      employeId = caisse.employe?.id,
      employeNom = "${caisse.employe?.user?.prenom ?: ""} ${caisse.employe?.user?.nom ?: ""}".trim(),
      dateOuvert = caisse.dateOuvert,
      dateFerme =null,
      session = caisse.session,
      fondCaisseOuvert = caisse.fondCaisseOuvert!!.toBigDecimal(),
      fondCaisseFerme =null,
      etat = caisse.etat
    )
  }

  // TODO: Implémenter la logique pour les autres opérations (fermerCaisse, enregistrerVente, enregistrerDepense, etc.)

  fun getAllCaisse(pageable: PageRequest): Page<Map<String, Any?>> {
    val activeCaisses = caisseRepository.findAll(pageable)
    val caisseDetails = activeCaisses.map { activeCaisse ->
      mapOf(
        "id" to activeCaisse.id as Any?,
        "etat" to activeCaisse.etat as Any?,
        "nomEmploye" to (activeCaisse.employe?.user?.nom ?: "Inconnu") as Any?,
        "dateOuvert" to activeCaisse.dateOuvert as Any?,
        "dateFerme" to activeCaisse.dateFerme as Any?
      )
    }
    return caisseDetails
  }

  fun setCaisseToPendingClosure(): Caisse {
    val activeCaisse = getActiveCaisse() ?: throw CaisseException("Aucune caisse active trouvée.")
    if (activeCaisse.etat!!.toLowerCase() != Caisse.ETAT_OUVERT.toLowerCase()) {
      throw CaisseException("La caisse n'est pas dans un état actif.")
    }

    activeCaisse.etat = Caisse.ETAT_CLOTURE_EN_ATTENTE
    return caisseRepository.save(activeCaisse)
  }

@Transactional
  fun cloturerCaisse(fondCaisseFerme: Int, fermetureCaisse: String): CaisseDto {
    val currentUser = userUtils.getCurrentUserId()
    val clotureCaisse = getCaisseAttenteCloture()

    if (clotureCaisse != null && clotureCaisse.employe?.user?.id?.toLong() == currentUser) {
      clotureCaisse.apply {
        this.fermetureCaisse = fermetureCaisse
        this.fondCaisseFerme = fondCaisseFerme.toDouble()
        this.dateFerme = LocalDateTime.now()
        this.etat = Caisse.ETAT_FERME
      }
      val updatedCaisse = caisseRepository.save(clotureCaisse)
      return mapToCaisseDto(updatedCaisse)
    } else {
      throw CaisseException("Unauthorized or no caisse found for closure.")
    }
  }

}

// Définir une exception personnalisée
class CaisseException(message: String) : RuntimeException(message)
