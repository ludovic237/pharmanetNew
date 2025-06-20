package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.models.Caisse
import com.example.backend.repositories.CaisseRepository
import com.example.backend.repositories.EmployeRepository
import com.example.backend.utility.UserUtils
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


  fun getActiveCaisse(): Caisse? {
      return caisseRepository.findByEtatAndSupprimer(Caisse.ETAT_OUVERT, 0)
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

  private fun mapToCaisseDto(caisse: Caisse): CaisseDto {
    return CaisseDto(
      id = caisse.id,
      employeId = caisse.employe?.id,
      employeNom = "${caisse.employe?.user?.prenom ?: ""} ${caisse.employe?.user?.nom ?: ""}".trim(),
      dateOuvert = caisse.dateOuvert,
      dateFerme = caisse.dateFerme,
      session = caisse.session,
      fondCaisseOuvert = caisse.fondCaisseOuvert!!.toBigDecimal(),
      fondCaisseFerme = caisse.fondCaisseFerme!!.toBigDecimal(),
      etat = caisse.etat
    )
  }

  // TODO: Implémenter la logique pour les autres opérations (fermerCaisse, enregistrerVente, enregistrerDepense, etc.)
}

// Définir une exception personnalisée
class CaisseException(message: String) : RuntimeException(message)
